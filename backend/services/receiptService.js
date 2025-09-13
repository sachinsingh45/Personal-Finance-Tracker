import { DocumentAnalysisClient, AzureKeyCredential } from "@azure/ai-form-recognizer";
import fs from "fs";

class ReceiptService {
  constructor() {
    this.client = null;
    this.initialized = false;
  }

  initializeClient() {
    if (this.initialized) return;
    
    const endpoint = process.env.AZURE_DOC_INTELLIGENCE_ENDPOINT;
    const apiKey = process.env.AZURE_DOC_INTELLIGENCE_KEY;
    
    console.log('Azure credentials check:', {
      endpoint: endpoint ? 'SET' : 'NOT SET',
      apiKey: apiKey ? 'SET' : 'NOT SET'
    });
    
    if (!endpoint || !apiKey) {
      console.warn('Azure Document Intelligence credentials not configured');
      this.client = null;
      this.initialized = true;
      return;
    }
    
    try {
      this.client = new DocumentAnalysisClient(
        endpoint, 
        new AzureKeyCredential(apiKey)
      );
      console.log('Azure Document Intelligence client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Azure client:', error);
      this.client = null;
    }
    
    this.initialized = true;
  }

  async analyzeReceipt(filePath) {
    try {
      // Initialize client on first use (lazy loading)
      this.initializeClient();
      
      if (!this.client) {
        throw new Error('Azure Document Intelligence not configured. Please add AZURE_DOC_INTELLIGENCE_ENDPOINT and AZURE_DOC_INTELLIGENCE_KEY to your environment variables.');
      }

      const fileStream = fs.createReadStream(filePath);
      
      // Use prebuilt receipt model
      const poller = await this.client.beginAnalyzeDocument("prebuilt-receipt", fileStream);
      const result = await poller.pollUntilDone();

      if (!result.documents || result.documents.length === 0) {
        throw new Error("No receipt data could be extracted from the image. Please ensure the image is clear and contains a valid receipt.");
      }

      const receipt = result.documents[0].fields;
      
      // Extract and format receipt data
      const extractedData = this.formatReceiptData(receipt);
      
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      
      return extractedData;
    } catch (error) {
      // Clean up file on error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw error;
    }
  }

  formatReceiptData(receipt) {
    // Extract merchant name
    const merchant = receipt.MerchantName?.content || 
                    receipt.MerchantAddress?.content?.split('\n')[0] || 
                    null;

    // Extract transaction date
    let transactionDate = null;
    if (receipt.TransactionDate?.content) {
      transactionDate = new Date(receipt.TransactionDate.content);
      // Validate date
      if (isNaN(transactionDate.getTime())) {
        transactionDate = null;
      }
    }

    // Extract total amount
    let total = null;
    if (receipt.Total?.content) {
      // Remove currency symbols and extract numeric value
      const totalStr = receipt.Total.content.toString().replace(/[^\d.-]/g, '');
      const parsedTotal = parseFloat(totalStr);
      if (!isNaN(parsedTotal) && parsedTotal > 0) {
        total = Math.round(parsedTotal); // Round to nearest rupee
      }
    }

    // Extract items for description
    let items = [];
    if (receipt.Items?.values) {
      items = receipt.Items.values.map(item => {
        const name = item.properties?.Description?.content || 
                    item.properties?.Name?.content || 
                    'Item';
        const price = item.properties?.Price?.content || 
                     item.properties?.TotalPrice?.content;
        return {
          name: name.trim(),
          price: price ? parseFloat(price.toString().replace(/[^\d.-]/g, '')) : null
        };
      }).filter(item => item.name && item.name !== 'Item');
    }

    // Generate description from items or merchant
    let description = '';
    if (items.length > 0) {
      description = items.map(item => item.name).join(', ');
    } else if (merchant) {
      description = `Purchase from ${merchant}`;
    }

    // Determine category based on merchant name (basic categorization)
    const category = this.categorizeTransaction(merchant, items);

    return {
      merchant,
      transactionDate,
      total,
      items,
      description: description.substring(0, 200), // Limit description length
      category,
      type: 'expense', // Receipts are typically expenses
      confidence: {
        merchant: receipt.MerchantName?.confidence || 0,
        total: receipt.Total?.confidence || 0,
        date: receipt.TransactionDate?.confidence || 0
      }
    };
  }

  categorizeTransaction(merchant, items) {
    if (!merchant && (!items || items.length === 0)) {
      return 'Other';
    }

    const merchantLower = (merchant || '').toLowerCase();
    const itemsText = items.map(item => item.name.toLowerCase()).join(' ');
    const combinedText = `${merchantLower} ${itemsText}`;

    // Food & Dining
    if (combinedText.match(/restaurant|cafe|coffee|food|pizza|burger|kitchen|dining|meal|lunch|dinner|breakfast/)) {
      return 'Food & Dining';
    }

    // Groceries
    if (combinedText.match(/grocery|supermarket|market|store|shop|mart|fresh|vegetables|fruits|milk|bread/)) {
      return 'Groceries';
    }

    // Transportation
    if (combinedText.match(/gas|fuel|petrol|diesel|uber|taxi|bus|train|metro|transport|parking/)) {
      return 'Transportation';
    }

    // Shopping
    if (combinedText.match(/mall|shopping|retail|clothes|fashion|electronics|amazon|flipkart/)) {
      return 'Shopping';
    }

    // Healthcare
    if (combinedText.match(/pharmacy|medical|hospital|clinic|doctor|medicine|health/)) {
      return 'Healthcare';
    }

    // Entertainment
    if (combinedText.match(/movie|cinema|theater|entertainment|game|sports|gym|fitness/)) {
      return 'Entertainment';
    }

    // Utilities
    if (combinedText.match(/electric|electricity|water|gas|internet|phone|mobile|utility/)) {
      return 'Utilities';
    }

    return 'Other';
  }
}

export default new ReceiptService();
