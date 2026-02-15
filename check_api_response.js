const axios = require('axios');

async function checkProfile() {
    try {
        // Assuming school ID 1 for testing, adjust if needed
        const response = await axios.get('http://localhost:3000/api/schools/1/profile');
        console.log('API Response Status:', response.status);
        console.log('API Response Data:', JSON.stringify(response.data, null, 2));

        if (response.data.schoolNumber) {
            console.log('SUCCESS: schoolNumber is present in response.');
        } else {
            console.log('FAILURE: schoolNumber is MISSING in response.');
        }
    } catch (error) {
        console.error('Error fetching profile:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

checkProfile();
