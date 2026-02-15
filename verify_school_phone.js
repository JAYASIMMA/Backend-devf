const axios = require('axios');

async function verifySchoolPhone() {
    const schoolId = 1; // Assuming ID 1 exists
    const testPhone = "9876543210";

    try {
        console.log("1. Fetching current profile...");
        const res1 = await axios.get(`http://localhost:3000/api/schools/${schoolId}/profile`);
        console.log("Current School Number:", res1.data.schoolNumber);

        console.log("2. Updating profile with new phone number...");
        await axios.put(`http://localhost:3000/api/schools/${schoolId}/profile`, {
            schoolNumber: testPhone
        });
        console.log("Update sent.");

        console.log("3. Fetching profile again to verify...");
        const res2 = await axios.get(`http://localhost:3000/api/schools/${schoolId}/profile`);
        console.log("New School Number:", res2.data.schoolNumber);

        if (res2.data.schoolNumber === testPhone) {
            console.log("SUCCESS: Phone number updated and retrieved correctly.");
        } else {
            console.log("FAILURE: Phone number did not match.");
        }

    } catch (error) {
        console.error("Error:", error.message);
        if (error.response) console.error(error.response.data);
    }
}

verifySchoolPhone();
