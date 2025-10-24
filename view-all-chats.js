// Quick script to view all chats in MongoDB
const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'chatbot';

async function viewChats() {
  const client = new MongoClient(url);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db(dbName);
    const chatsCollection = db.collection('chats');
    
    // Get all chats
    const chats = await chatsCollection.find({}).toArray();
    
    console.log(`📊 Total chats: ${chats.length}\n`);
    console.log('═'.repeat(80));
    
    if (chats.length === 0) {
      console.log('No chats found in database yet.');
    } else {
      chats.forEach((chat, index) => {
        console.log(`\n🗨️  Chat #${index + 1}`);
        console.log('─'.repeat(80));
        console.log(`ID: ${chat._id}`);
        console.log(`Title: ${chat.title}`);
        console.log(`User ID: ${chat.userId}`);
        console.log(`Created: ${new Date(chat.createdAt).toLocaleString()}`);
        console.log(`Updated: ${new Date(chat.updatedAt).toLocaleString()}`);
        console.log(`Messages: ${chat.messages.length}`);
        
        if (chat.messages.length > 0) {
          console.log('\n  💬 Messages:');
          chat.messages.forEach((msg, msgIndex) => {
            console.log(`  ${msgIndex + 1}. [${msg.role.toUpperCase()}] ${msg.content.slice(0, 80)}${msg.content.length > 80 ? '...' : ''}`);
            if (msg.model) console.log(`     Model: ${msg.model}`);
            console.log(`     Time: ${new Date(msg.createdAt).toLocaleString()}`);
          });
        }
        
        console.log('═'.repeat(80));
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n✅ Connection closed');
  }
}

viewChats();
