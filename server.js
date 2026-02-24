const express = require('express');
const cors = require('cors');
// REMOVED node-fetch require because it's built into Node v22
const app = express();

app.use(cors());
app.use(express.json());

const apiKey = process.env.MISTRAL_API_KEY; 
const agentId = process.env.AGENT_ID;

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    const payload = {
        agent_id: agentId,
        inputs: [{ role: "user", content: message }]
    };

    try {
        // Using built-in fetch
        const response = await fetch("https://api.mistral.ai/v1/conversations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        // Log the data to Render logs so we can see if Mistral is angry
        console.log("Mistral Response:", JSON.stringify(data));

        let botReply = "";
        if (data.outputs && data.outputs[0]) {
            botReply = data.outputs[0].content;
        } else if (data.choices && data.choices[0]) {
            botReply = data.choices[0].message.content;
        } else {
            botReply = "API Error: Check Render logs for details.";
        }

        res.json({ reply: botReply });

    } catch (error) {
        console.error("MISTRAL FETCH ERROR:", error);
        res.status(500).json({ error: "Server failed to reach AI." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is live on port ${PORT}`);
});
