async function submitUserInfo(e) {
    try {
        e.preventDefault();
        let userInfo = {
            name: e.target.name.value,
            email: e.target.email.value,
            password: e.target.password.value
        }
        let responseData = await axios.post('http://localhost:3000/user/signUp', userInfo);

        if (responseData.status === 201) {
            document.location.href = './login/login.html'; //change signup page to login page
        }
    } catch (error) {
        let errorElement = document.getElementById('error');
        if (error.response === undefined) {
            errorElement.innerHTML = `<p id="errorChild" style="color:red">${error.message}</p>`;
        } else {
            errorElement.innerHTML = `<p id="errorChild" style="color:red">${error.response.data.message}</p>`;
        }

    }
}