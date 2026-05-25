const axios = require('axios');
(async () => {
  try {
    const loginRes = await axios.post('http://127.0.0.1:8000/api/v1/school/auth/login', {
      email: 'staff01@gmail.com',
      password: 'Staff09?'
    });
    const token = loginRes.data.access_token;
    console.log('Got token');
    const stRes = await axios.get('http://127.0.0.1:8000/api/v1/admin/school-types', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(JSON.stringify(stRes.data, null, 2));
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
})();
