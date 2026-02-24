const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const apiKey = process.env.MISTRAL_API_KEY ||'w6wS2RXI8f2I1IjbDB9FEaTR1PWCFayq'; 
const agentId = process.env.AGENT_ID ||'ag_019c9025025775f792f2f5f444aec7b3';

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    // This matches the Mistral CURL structure exactly
    const payload = {
        agent_id: agentId,
        inputs: [
            {
                role: "user",
                content: message
            }
        ]
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
        console.log("Mistral Response:", JSON.stringify(data));

        let botReply = "";

        // TARGETED FIX: Looking inside the 'outputs' array as seen in your logs
        if (data.outputs && data.outputs[0] && data.outputs[0].content) {
            botReply = data.outputs[0].content;
        } 
        // Fallback for standard chat models
        else if (data.choices && data.choices[0] && data.choices[0].message) {
            botReply = data.choices[0].message.content;
        } 
        else {
            botReply = "I received the data, but couldn't extract the message.";
            console.log("Unexpected Structure:", data);
        }

        res.json({ reply: botReply });

    } catch (error) {
        console.error("DETAILED ERROR:", error); // This will show up in your Render Logs
        res.status(500).json({ error: "Could not reach Mistral: " + error.message });
    }

    // Find the catch block at the bottom of your /api/chat route and change it to this:
} catch (error) {
    console.log("--- MISTRAL ERROR LOG ---");
    console.log(error); 
    res.status(500).json({ error: "Mistral Error: " + error.message });
}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

});

