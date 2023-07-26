async function submitInfo(e) {
    try {
        e.preventDefault();
        const emailId = e.target.email.value;
        let data = await axios.post('http://localhost:3000/password/forgotpassword', { emailId: emailId });
        if (data.status === 201) {
            document.getElementById('message').innerHTML = `<p>${data.data.message}</p>`;
            let errorElement = document.getElementById('error');
            errorElement.remove(document.getElementById('errorChild'));
        } else {
            throw new Error('User is not registered');
        }
    } catch (error) {
        let errorElement = document.getElementById('error');
        if (error.response === undefined) {
            errorElement.innerHTML = `<p id="errorChild" class="m-3" style="color:red">${error.message}</p>`;
        } else {
            errorElement.innerHTML = `<p id="errorChild" class="m-3" style="color:red">${error.response.data.message}</p>`;
        }
    }

}