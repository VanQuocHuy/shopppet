//Đối tượng Validator
function Validator(options) {
    function getParent(element, seletor) { //element truyền vào, selector trả về
        while (element.parentElement) { // kiểm tra element truyền vào có thẻ cha không để tránh lặp vô hạn, nếu có thẻ cha tương ứng mới chạy vòng lặp
            if (element.parentElement.matches(seletor)) { //kiểm tra có thẻ cha tương ứng với thẻ con ở trong không(vd: form-message nằm trong thẻ cha form-group)
                return element.parentElement; //trả về thẻ cha
            }
            element = element.parentElement; //Nếu không có thẻ cha tương ứng thì gán thẻ con đó cho thẻ cha rồi tiếp tục vòng lặp
        }
    }

    var selectorRules = {}  //Tạo object để gán các rule vào

    //hàm này để thực hiện việcc báo lỗi hoặc bỏ lỗi đi của Tên người dùng
    function validate(inputElement, rule) {
        var errorElement = getParent(inputElement, options.forGroupSelector).querySelector(options.errorSelector); //Lấy element cha hiện tại rồi từ element đó, kiếm class con là form-message
        var errorMessage; //rule là 1 phẩn tử của mảng, test là giá trị nhập, inputElement là giá trị nhập vào của 1 thẻ nào đó, value là giá trị,trả về lỗi hoặc không có lỗi

        //Lấy ra các rule của selector
        var rules = selectorRules[rule.seletor];

        //Lặp qua từng rule & kiểm tra, nếu có lỗi thì dừng việc kiểm tra,mục đích là sau mỗi lần lặp sẽ hiển thị các yêu cầu khác nhau(vd: lần 1 là nhập vào, nếu không nhập thì báo lỗi bắt nhập, nếu nhập sai thì báo nhập đúng)
        for(var i = 0; i < rules.length; ++i) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.seletor + ':checked')
                    );
                    break;
                default: errorMessage = rules[i](inputElement.value) //Lấy các giá trị của các dữ liệu nhập vào tương ứng với mỗi phần tử
            }
            if(errorMessage) break;
        }
        
        if(errorMessage) { //Nếu người dùng nhập sai
            errorElement.innerText = errorMessage; //xuất nội dung của errorMessage ra màn hình 
            getParent(inputElement, options.forGroupSelector).classList.add('invalid') // thêm class invalid vào thẻ cha của input
        }
        else {//Nếu người dùng nhập đúng
            errorElement.innerText = ''
            getParent(inputElement, options.forGroupSelector).classList.remove('invalid') //xóa class
        }
        
        return !errorMessage; //true


    }
    //Lấy element của form cần validate
    var formElement = document.querySelector(options.form) //Lấy Element (thuộc tính) của form, vd như id,class..

    if(formElement) { //Nếu có element
        //Khisubmit form
        formElement.onsubmit = function(e) { //Nhận một đổi số khi bấm vào form submit,(onsubmit ở đây là 1 funciton định nghĩ sẵn)
            e.preventDefault(); //bỏ đối số e nhận được sau khi bấm submit

            var isFormValid = true;

            //Lặp qua từng rule và validate
            options.rules.forEach(function(rule) {
                var inputElement = formElement.querySelector(rule.seletor) // Lấy input của các element trong form-1
                var isValid = validate(inputElement, rule) //hàm này để thực hiện việc báo lỗi hoặc bỏ lỗi đi, trong trường hợp này nếu bấm submit thì sẽ thông báo tất cả các lỗi ở ô input
                if (!isValid) { //Nếu có 1 rule(tên đầy đủ,email,mật khẩu,nhập lại mật khẩu) không isValid(báo lỗi khi nhập sai hoặc bỏ thông báo đó khi nhập đúng) thì form sai
                    isFormValid = false;
                }
            });
            //Lấy dữ liệu người dùng nhập vào
            if(isFormValid) {
                //Bấm đăng nhập / đăng kí
                //trường hợp submit với javascript
                if (typeof options.onSubmit === 'function') { //option mình bấm vào là 1 function thì thực hiện các lệnh trong này 
                   
                    var enableInputs = formElement.querySelectorAll('[name]') //select (Lấy) tất cả các input ở trạng thái enble(nhận giá trị nhập vào) có fill là name và không có atribute là disabled(không được tương tác) <:not[disabled]>
      
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {//Tất cả các value của form, enableInputs là nodeList và sẽ được form convert sang kiểu array để sử dụng reduce để lấy ra tất cả value của mảng
                        switch(input.type) {
                            case 'radio': //Trường hợp là radio (chọn 1 trong tất cả)
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value; //Lấy value của class nào có đuôi name là checked (đưuọc tích vào)
                            case 'checkbox'://Trường hợp là checkbox (chọn tùy thích)
                                if (!input.matches(':checked')){ //Kiểm tra nếu input không được checked thì trả về values tổng
                                    values[input.name] = '';
                                    return values;
                                }
                                if(!Array.isArray(values[input.name])) { //Kiểm tra nếu value của name input không phải là array thì gán cho nó là 1 array
                                    values[input.name] = []
                                }

                                values[input.name].push(input.value) //thêm cái input.value vào trong  values tổng
                                break;
                            case 'file': //Trường hợp chọn file
                                values[input.name] = input.files; //Trả về 1 fileList để dễ làm
                                break;
                            default:
                                values[input.name] = input.value; // giá trị nhập vào của ô input name = giá trị nhập vào và (&&) return values(vd:return a= 1+2 && a tức là return cả 2 vế đều có kết quả là a = 3)
                        }
                        return values; 
                     }, {}); //{} = value = giá trị khởi tạo
                    
                    options.onSubmit(formValues) //Trả về các giá trị lấy được (onSubmit ở đây là function được mình tự định nghĩa)
               } 
               //Trường hợp submit với hành vi mặc định
               else {
                    formElement.submit();
               }
            }
        }

        //Xử qua mỗi rule và xử lí (lắng nghe sự kiện blur, input, ...)

        options.rules.forEach(function(rule) { //lấy từng rule trong rules tổng
            //Lưu lại các rules trong input
            if(Array.isArray(selectorRules[rule.seletor])) { //Kiểm tra trong mảng có rule không
                selectorRules[rule.seletor].push(rule.test); //Nếu trong mảng đã có rule  rồi thì thêm phần tử rule tiếp theo vào 
            } else {
                selectorRules[rule.seletor] = [rule.test]; //nếu trong mảng chưa có phần tử đó thì có sẽ tạo mảng và gán phần tử đó vào mảng
            }

            var inputElements = formElement.querySelectorAll(rule.seletor) // Lấy input của các element trong form-1

            Array.from(inputElements).forEach(function (inputElement) {// chuyển inputElements từ nodeList sang array và tiến hành lấy các phần tử inputElement ở trong ra Xử lý trường hợp blur ra ngoài
                inputElement.onblur = function() { //click vào ô input rồi click ra khỏi ô đó(onblur)
                    validate(inputElement, rule)
                }

                //Xử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = function() { //oninput: khi người dùng đang nhập
                    var errorElement = getParent(inputElement, options.forGroupSelector).querySelector(options.errorSelector); //Lấy element cha hiện tại rồi từ element đó, kiếm class con là form-message
                    
                    errorElement.innerText = ''
                    getParent(inputElement, options.forGroupSelector).classList.remove('invalid') //xóa class
                }
            });
        })
    }
}

//Định nghĩa rules
/*Nguyên tắc của rules (tự định nghĩa):
    1. Khi có lỗi => trả ra message lỗi
    2. Khi hợp lệ => Không trả ra cái gì cả(underfine)
*/

//Xử lý Tên nhập vào
Validator.isRequired = function(seletor, message) {
    return {
        seletor: seletor, //đối số truyền vào
        test: function(value) { //kiểm tra người dùng có nhập chưa, nhận 1 value để kiểm tra
            return value ? undefined : message || '(*.)Vui lòng nhập đầy đủ thông tin' //value.trim() để loại bỏ trường hợp người dùng chỉ nhập dấu cách
        }
    }
}

//Xử lý email nhập vào
Validator.isEmail = function(seletor, message) { //email
    return {
        seletor: seletor, //đối số truyền vào
        test: function(value) { //kiểm tra email đúng kiểu chưa (search: javascript email regex)
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; //kiểm tra có phải email không
            return regex.test(value) ? undefined : message || '(*.)Vui lòng nhập đúng email của bạn'
        }
    }
}

//Xử lý mật khẩu nhập vào
Validator.minLength = function(seletor, min, max, message) { //password, truyền vào 1 giá trị và độ dài
    return {
        seletor: seletor, //đối số truyền vào
        test: function(value) {
            return (value.length >= min && value.length <= 24) ? undefined : message || `(*.)Vui lòng nhập mật khẩu từ ${min} đến ${max}kí tự`
        }
    }
}

//Xử lý kiểm tra lại mật khẩu có trùng với mật khẩu ở trên không
Validator.isConfirmed = function(seletor, getConfirmValue, message) {// đối số thứ 3 là text mình nhập vào(có thể có hoặc không), dùng trong trường hợp 1 hàm dùng cho nhiều form khác nhau(vì lười),vd như dùng cho cả đăng nhập đăng kí,..
    return {
        seletor: seletor,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || '(*.)Mật khẩu không khớp,vui lòng nhập lại';
        }
    }
}



//---------------Xử lý API------------------

var infoApi = 'http://localhost:3000/informationdk'

//-----Đăng ký-----

//Hàm lấy ra kết quả của email kiểm tra để bỏ vào checkEmail
function checkUsers(mail,callback) { //call back là đối số truyền vào ( ở trong trường hợp này là hàm checkEmail)
    fetch(infoApi)
        .then(function(response) {//response là tất cả các phần tử ở trong infoApi
            return response.json();
        })
        .then(function(posts) { 
            return posts.some(function(post) {
                return post.email === mail;
            })            
        })
        .then(callback)
}

//Hàm tạo ra thông tin mới để bỏ vào database
function createInfo(data, callback) {
    var Option = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }
    fetch(infoApi, Option)
        .then(function(response) {
            response.json();
        })
        .then(callback)
}

//xử lí form thêm chữ vào form
function handerCreateFormRegister() {
    let resultEmail;
    var createBtnRegister = document.querySelector('#form-submit-register');

    createBtnRegister.onclick = function() {
        var fullname = document.querySelector('input[name="fullname"]').value;
        var email = document.querySelector('input[name="email_register"]').value;
        var password = document.querySelector('input[name="password_register"]').value;
        var password_confirmation = document.querySelector('input[name="password_confirmation"]').value;
        var province = document.querySelector('select[name="province"]').value;        

        checkUsers(email,checkEmail);
        function checkEmail(info) {
            resultEmail = info;
            return resultEmail;
        }
        setTimeout(function() {
            if (fullname === '' || email === '' || password === '' || password_confirmation === '' || province === '') {}
            else if(resultEmail) {
                alert("Email đã tồn tại")
            }
            else{
                var formData = {
                    fullname: fullname,
                    email: email,
                    password: password,
                    password_confirmation: password_confirmation,
                    province: province,
                }
                
                createInfo(formData, function() {
                    alert('Đăng ký thành công')
                });
            }
        }, 500)
    }
}

//-----Đăng nhập-------
function checkPassword(email, password,callback) {
    fetch(infoApi)
        .then(function(response) {
            return response.json();
        })
        .then(function(posts) {
            return posts.some(function(post) {
                if (password === post.password) {
                    return email === post.email
                }
            })
        })
        .then(callback)
}
function getName(callback) {
    fetch(infoApi)
        .then(function(response) {
            return response.json();
        })
        .then(callback)
}

//hàm xuất thông tin khóa học ra trình duyệt
function renderInfo(listnames) {
    var  listInfoBlock = document.querySelector('.header__navbar-user');
    var htmls = listnames.map(function(listname) {
        return `
            <span class="header__navbar-user-name">${listname.fullname}</span>
            <ul class="header__navbar-user-menu">
                <li class="header__navbar-user-item">
                    <a href="" class="ti-id-badge"> Tài khoản</a>
                </li>
                <li class="header__navbar-user-item">
                    <a href="" class="ti-location-pin"> Địa chỉ</a>
                </li>
                <li class="header__navbar-user-item">
                    <a href="" class="ti-shopping-cart-full"> Đơn mua</a>
                </li>
                <li class="header__navbar-user-item header__navbar-user-item--separate">
                    <a href="" class="ti-back-right"> Đăng xuất</a>
                </li>
            </ul>
        `
    })
    listInfoBlock.innerHTML = htmls.join('');
}

function handerCreateFormLogin() {
   let resultEmail;
   let resultPass;
   var createBtnLogin = document.querySelector('#form-submit-login')

   createBtnLogin.onclick = function() {
       var email = document.querySelector('input[name="email_Login"]').value;
       var password = document.querySelector('input[name="password_Login"]').value;

       checkUsers(email,checkEmail)
       function checkEmail(info) {
           resultEmail = info;
           return resultEmail
       }

       checkPassword(email,password,checkPass)
       function checkPass(info) {
            resultPass = info;
            return resultPass
       }

       setTimeout(function() {
            if(resultEmail) {
                // alert('Có email này')
                if(resultPass) {
                    alert('Đăng nhập thành công')
                    getName(renderInfo)
                }
                else {
                    alert('Mật khẩu không chính xác')
                }
            }
            else {
                alert('Tài khoản không tồn tại')
            }
       }, 500)
   }
}

//show thông báo
