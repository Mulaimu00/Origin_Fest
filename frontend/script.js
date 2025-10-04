const apiBase = "http://127.0.0.1:8000";

document.getElementById("carbonForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const dieselLiters = parseFloat(document.getElementById("dieselLiters").value);

    try {
        // Step 1: Call /calculate to get CO2 emissions
        const calcResponse = await fetch(`${apiBase}/calculate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Diesel_Liters: dieselLiters, CO2_Emissions: 0 })
        });

        if (!calcResponse.ok) {
            throw new Error("Failed to calculate emissions");
        }

        const calcData = await calcResponse.json();

        // Step 2: Pass CO2_Emissions_Estimate into /verify
        const verifyResponse = await fetch(`${apiBase}/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                Diesel_Liters: calcData.Diesel_Liters,
                CO2_Emissions: calcData.CO2_Emissions_Estimate
            })
        });

        if (!verifyResponse.ok) {
            throw new Error("Failed to verify anomaly");
        }

        const verifyData = await verifyResponse.json();

        // Step 3: Update results in UI
        document.getElementById("result").innerHTML = `
            <strong>Diesel Used:</strong> ${calcData.Diesel_Liters} L<br>
            <strong>Estimated CO₂:</strong> ${calcData.CO2_Emissions_Estimate.toFixed(2)} g<br>
            <strong>Anomaly:</strong> ${verifyData.Anomaly ? "⚠ Yes (Unusual pattern)" : "✅ No (Normal)"}<br>
            <strong>Score:</strong> ${verifyData.Score.toFixed(3)}
        `;
    } catch (error) {
        document.getElementById("result").innerHTML = `<span style="color:red;">${error.message}</span>`;
    }
});