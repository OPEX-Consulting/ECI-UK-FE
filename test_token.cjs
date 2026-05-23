const axios = require('axios');
(async () => {
  try {
    const signupRes = await axios.post('http://127.0.0.1:8000/api/v1/school/auth/signup/email', {
      email: 'testschool@test.com',
      password: 'StrongPassword1!',
      confirm_password: 'StrongPassword1!',
      name: 'Test Admin'
    });
    console.log("Signup ok");
    
    // Actually OTP is sent. To skip OTP, maybe I can just find a token in localStorage if I could run in the browser.
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
})();
