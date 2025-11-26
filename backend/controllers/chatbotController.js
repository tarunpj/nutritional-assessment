const axios = require('axios');
const User = require('../models/User');

const chatWithBot = async (req, res) => {
  try {
    const { message } = req.body;
    const user = await User.findById(req.user.id);
    
    const systemPrompt = `You are NutriBot, a friendly and knowledgeable nutrition and diet assistant. 

User Profile:
- Name: ${user.first_name}
- Age: ${user.age}
- Weight: ${user.weight}kg
- Height: ${user.height}cm
- BMI: ${User.calculateBMI(user.weight, user.height)}
- Goal: ${user.goal}
- Activity Level: ${user.activity_level}
- Daily Calorie Target: ${User.calculateCalories(user.weight, user.height, user.age, user.gender, user.activity_level, user.goal)}

Guidelines:
- Be friendly, encouraging, and supportive
- Give personalized advice based on their profile
- Provide specific, actionable nutrition and fitness tips
- Use emojis to make responses engaging
- Keep responses concise but informative
- If asked about medical conditions, advise consulting a healthcare professional
- Focus on healthy, sustainable lifestyle changes

Respond to the user's question with personalized advice.`;

    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 300,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const botResponse = response.data.choices[0].message.content;

    res.json({
      message: botResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chatbot error:', error.response?.data || error.message);
    res.json({
      message: "Hi there! 👋 I'm your nutrition assistant. I can help you with diet advice, meal planning, and healthy lifestyle tips. What would you like to know?",
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = { chatWithBot };