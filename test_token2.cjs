const axios = require('axios');
(async () => {
  try {
    const loginRes = await axios.post('http://127.0.0.1:8000/api/v1/school/auth/login', {
      email: 'testschool@test.com',
      password: 'StrongPassword1!'
    });
    const token = loginRes.data.access_token;
    console.log('Got token:', token.substring(0, 10));
    const stRes = await axios.get('http://127.0.0.1:8000/api/v1/admin/school-types', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Got data:', stRes.data.length, 'items');
    console.log(JSON.stringify(stRes.data, null, 2));
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
})();
