async function submitUserInfo(e) {
    try {
        e.preventDefault();
        let userInfo = {
            email: e.target.email.value,
            password: e.target.password.value
        }

        let responseData = await axios.post('http://localhost:3000/user/login', userInfo);
        if (responseData.status === 201) {
            window.alert(responseData.data.message); //change signup page to login page
            localStorage.setItem('token', responseData.data.token);
            window.location.href = '../expense/expense.html';
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

document.getElementById('forgotPassword').onclick = async function (e) {
    window.location.href = '../password/password.html';
}
