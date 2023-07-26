const itemList = document.getElementById('itemList');
let token = localStorage.getItem('token');
// dom content loaded function
window.addEventListener('DOMContentLoaded', async () => {
    try {
        let decodedToken = parseJwt(token);

        let ispremiumuser = decodedToken.ispremiumuser;
        if (ispremiumuser === true) {
            premiumStatusMessage();
            leaderBoardButton();
            downloadButtonFun();
            ListsOfDownloadButtonFunc();
        }
        const page = 1;
        getProducts(page);
    } catch (error) {
        errorMessage(error);
    }
});
//post data form function
async function submitExpense(e) {
    try {
        e.preventDefault();
        let newAmount = + e.target.amount.value;
        const expenseDetails = {
            amount: newAmount,
            description: e.target.description.value,
            category: e.target.category.value
        };
        let itemsPerPage = localStorage.getItem('itemsPerPage');
        let responseData = await axios.post(`http://localhost:3000/expense/add-expense?itemsPerPage=${itemsPerPage}`, expenseDetails, { headers: { 'Authorization': token } });
        postProducts(responseData.data);

    } catch (error) {
        errorMessage(error);
    }
};
// show output of expenses in the window
function showOutput(data) {
    let li = document.createElement('li');
    li.className = "m-1";
    li.id = data.id;
    let text1 = document.createTextNode(`${data.amount} - ${data.description} - ${data.category} `);
    li.append(text1);
    let button = document.createElement('button');
    let text2 = document.createTextNode('Delete');
    button.className = "btn btn-danger m-1";
    button.append(text2);
    button.onclick = function () {
        removefromscreen(data);
    }
    li.append(button);
    itemList.append(li);
}
//remove element from the ui and database
async function removefromscreen(data) {
    try {
        let page = localStorage.getItem('page');
        let itemsPerPage = localStorage.getItem('itemsPerPage');
        let responseData = await axios.delete(`http://localhost:3000/expense/delete-expense/${data.id}?page=${page}&itemsPerPage=${itemsPerPage}`, { headers: { 'Authorization': token } });
        if (responseData.status === 201) {
            postProducts(responseData.data);
        }

    } catch (error) {
        errorMessage(error);
    }
}
// razor pay button 
document.getElementById('rzp-button1').onclick = async function (e) {
    let response = await axios.get('http://localhost:3000/purchase/purchasemembership', { headers: { 'Authorization': token } });
    var options = {
        "key": response.data.key_id,
        "order_id": response.data.order.id,
        "handler": async function (response) {
            let respData = await axios.post('http://localhost:3000/purchase/updatetransactionstatus', {
                order_id: options.order_id,
                payment_id: response.razorpay_payment_id
            }, { headers: { 'Authorization': token } });
            premiumStatusMessage();
            leaderBoardButton();
            downloadButtonFun();
            ListsOfDownloadButtonFunc();
            localStorage.setItem('token', respData.data.token);
            alert("You are a premium user now");
        }
    };
    const rzp1 = new Razorpay(options);
    rzp1.open();
    rzp1.on('payment.failed', async function (response) {
        await axios.post('http://localhost:3000/purchase/failedtransactionstatus', {
            order_id: options.order_id,
        }, { headers: { 'Authorization': token } });
        alert('Something went wrong');
    })
};
// showing error message
function errorMessage(error) {
    let errorElement = document.getElementById('error');
    if (error.response === undefined) {
        errorElement.innerHTML = `<p id="errorChild" style="color:red">${error.message}</p>`;
    } else {
        errorElement.innerHTML = `<p id="errorChild" style="color:red">${error.response.data.message}</p>`;
    }
    setTimeout(() => {
        errorElement.removeChild(document.getElementById('errorChild'));
    }, 5000);
}
// showing premium message and button
function premiumStatusMessage() {
    let userTitle = document.getElementById('userPremiumTitle');
    userTitle.innerHTML = "You are a premium user";
    let rzpButton = document.getElementById('rzp-button1');
    rzpButton.style.visibility = 'hidden';
}
// parsing token function
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}
//leader board functionality
function leaderBoardButton() {
    let userTitle = document.getElementById('userPremiumTitle');
    userTitle.innerHTML = userTitle.innerHTML + `<button id="showLeaderboardId" class="btn btn-warning m-2">Show Leaderboard</button>`
    document.getElementById('showLeaderboardId').onclick = async function (e) {
        try {
            e.preventDefault();
            let responseData = await axios.get('http://localhost:3000/premium/showLeaderBoard', { headers: { 'Authorization': token } });
            leaderboardHeading();
            initialLeaderBoardScreenClean();
            for (let i = 0; i < responseData.data.length; i++) {
                showLeaderBoardScreen(responseData.data[i]);
            }
        } catch (error) {
            errorMessage(error);
        }
    };
}
//leader board heading title function 
function leaderboardHeading() {
    let leaderHeading = document.getElementById('leaderboardheading');
    leaderHeading.innerHTML = `<h2 class="fs-2 mb-3 m-3 text-dark">Leaderboard</h2>`;
}
//list of download heading function
function downloadListHeadingFun() {
    let downloadHeading = document.getElementById('downloadheadingTitle');
    downloadHeading.innerHTML = `<h2 class="fs-2 mb-3 m-3 text-dark">List of downloads</h2>`;
}
// clear screen for leaderboard lists function
function initialLeaderBoardScreenClean() {
    let leaderList = document.getElementById('leaderboardLists');
    leaderList.innerHTML = '';
}
// clear screen for list of download users
function initialDownloadListsScreenClean() {
    let downloadLists = document.getElementById('downloadLists');
    downloadLists.innerHTML = '';
}
// leaderboard lists data
function showLeaderBoardScreen(data) {
    let leaderList = document.getElementById('leaderboardLists');
    leaderList.innerHTML += `<li  class="m-1">Name - ${data.name} , Total Expense - ${data.totalExpense}</li>`;
}
// download lists of expenses data
function downloadListsFun(data) {
    let downloadLists = document.getElementById('downloadLists');
    downloadLists.innerHTML += `<li  class="m-1 text-dark">Date - ${new Date(data.date)} - <a href="${data.url}">Link</a></li>`;
}
// download of all expenses through S3 button 
function downloadButtonFun() {
    let buttonParent = document.getElementById('expenseDownload');
    let button = document.createElement('button');
    let text1 = document.createTextNode('Download File');
    button.className = "btn btn-primary";
    button.id = 'downloadFile';
    button.append(text1);
    buttonParent.append(button);
    document.getElementById('downloadFile').onclick = async function (e) {
        try {
            e.preventDefault();
            let respData = await axios.get('http://localhost:3000/expense/download', { headers: { "Authorization": token } });
            if (respData.status === 201) {
                var a = document.createElement("a");
                a.href = respData.data.fileUrl;
                a.download = 'myexpense.csv';
                a.click();
            }
        } catch (error) {
            errorMessage(error);
        }
    }
}
//list of ownload of expenses button
function ListsOfDownloadButtonFunc() {
    let buttonParent = document.getElementById('downloadListButton');
    let button = document.createElement('button');
    let text1 = document.createTextNode('Show list of downloads');
    button.className = "btn btn-info";
    button.id = 'listOfUrls';
    button.append(text1);
    buttonParent.append(button);
    document.getElementById('listOfUrls').onclick = async function (e) {
        try {
            e.preventDefault();
            let respData = await axios.get('http://localhost:3000/expense/lists', { headers: { "Authorization": token } });
            if (respData.status === 201) {
                downloadListHeadingFun();
                initialDownloadListsScreenClean();
                if (respData.data.length > 0) {
                    for (let i = 0; i < respData.data.length; i++) {
                        downloadListsFun(respData.data[i]);
                    }
                } else {
                    let downloadLists = document.getElementById('downloadLists');
                    downloadLists.innerHTML = `<p>No download happens</p>`;
                }

            }
        } catch (error) {
            errorMessage(error);
        }
    }
}
//Pagination 
function showPagination(data) {
    let { currentPage, hasCurrentPage, hasNextPage, nextpage, hasPreviousPage, previousPage, hasLastPage, lastPage } = data;
    let pagination = document.getElementById('paginationId');
    pagination.innerHTML = '';
    if (hasPreviousPage) {
        paginationButton(previousPage);
    }
    if (hasCurrentPage) {
        paginationButton(currentPage);
    }
    if (hasNextPage) {
        paginationButton(nextpage);
    }
    if (hasLastPage) {
        paginationButton(lastPage);
    }
}
//pagination all buttons creating here
function paginationButton(page) {
    let pagination = document.getElementById('paginationId');
    const button = document.createElement('button');
    button.className = "btn btn-outline-primary";
    button.append(page);
    button.onclick = function () {
        getProducts(page);
    }
    pagination.append(button);
}
// get all  the expenses for dom content loaded
async function getProducts(page) {
    try {
        let itemsPerPage = localStorage.getItem('itemsPerPage');
        let responseData = await axios.get(`http://localhost:3000/expense/get-expense?page=${page}&itemsPerPage=${itemsPerPage}`, { headers: { 'Authorization': token } });
        if (responseData.status === 201) {
            localStorage.setItem('page', page);
            itemList.innerHTML = '';
            for (let i = 0; i < responseData.data.product.length; i++) {
                showOutput(responseData.data.product[i]);
            }
            showPagination(responseData.data.pageData);
        }
    } catch (error) {
        errorMessage(error);
    }
}
// get all data for expenses of delete and post 
async function postProducts(data) {
    itemList.innerHTML = '';
    for (let i = 0; i < data.product.length; i++) {
        showOutput(data.product[i]);
    }
    showPagination(data.pageData)
}
//set the value of page in loacalstorage
document.getElementById('itemsPerPageId').onclick = async function (e) {
    e.preventDefault();
    localStorage.setItem('itemsPerPage', e.target.value);
}
