import axios from 'axios';

const checkServer = async () => {
    try {
        // Assuming server runs on port 3000
        const response = await axios.get('http://localhost:3000/');
        console.log('Server is running. Status:', response.status);
    } catch (error: any) {
        console.log('Server check failed:', error.message);
    }
};

checkServer();
