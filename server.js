const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Keys from Render Environment Variables
const apiKey = process.env.MISTRAL_API_KEY; 
const agentId = process.env.AGENT_ID;

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    const payload = {
        agent_id: agentId,
        inputs: [{ role: "user", content: message }]
    };

    try {
        const response = await fetch("https://api.mistral.ai/v1/conversations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        let botReply = "";
        if (data.outputs && data.outputs[0]) {
            botReply = data.outputs[0].content;
        } else if (data.choices && data.choices[0]) {
            botReply = data.choices[0].message.content;
        } else {
            botReply = "API Error: Unexpected response format.";
        }

        res.json({ reply: botReply });

    } catch (error) {
        console.error("MISTRAL ERROR:", error);
        res.status(500).json({ error: "Mistral Error: " + error.message });
    }
}); // This is where the error likely was!

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

