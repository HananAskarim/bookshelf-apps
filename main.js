const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_NEW_EVENT = 'saved-book';
const STORAGE_BOOK = 'BOOKSHELF-APPS';

// load html dan menyimpan data
document.addEventListener('DOMContentLoaded', function () {
    const inputForm = document.getElementById('inputBook');
    inputForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBookshelf();
    });
    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

// fungsi addBookshelf untuk menambahkan buku baru
function addBookshelf(){
    const textBookTitle = document.getElementById('inputBookTitle').value;
    const textBookAuthor = document.getElementById('inputBookAuthor').value;
    const inputBookYear = document.getElementById('inputBookYear').value;
    const checkBox = document.getElementById('inputBookIsComplete').checked;
    
    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, textBookTitle, textBookAuthor, inputBookYear, checkBox);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

// fungsi unik ID book
function generateId(){
    return +new Date();
}

// fungsi untuk skema data (generateBookObject)
function generateBookObject(id, title, author, year, isCompleted){
    return {
        id,
        title,
        author,
        year,
        isCompleted
    }
}

// membuat fungsi makeBookshelf untuk menampilkan data
function makeBookshelf(bookObject){
    const textTitle = document.createElement('h3');
    textTitle.innerText = bookObject.title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = 'Penulis: ' + bookObject.author;

    const dateYear = document.createElement('p');
    dateYear.innerText = 'Tahun: ' + bookObject.year;

    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(textTitle, textAuthor, dateYear);

    const container = document.createElement('article');
    container.classList.add('book_item');
    container.append(textContainer);
    container.setAttribute('id', `book-${bookObject.id}`);

    if (bookObject.isCompleted){
        const undoButton = document.createElement('button');
        undoButton.classList.add('green');
        undoButton.innerText = 'Belum selesai dibaca';

        undoButton.addEventListener('click', function () {
            undoTaskFromCompleted(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('red');
        trashButton.innerText = 'Hapus Buku';

        trashButton.addEventListener('click', function () {
            removeTaskToCompleted(bookObject.id);
        });

        container.append(undoButton, trashButton);
    } else {
        const checkedButton = document.createElement('button');
        checkedButton.classList.add('green');
        checkedButton.innerText = 'Sudah dibaca';

        checkedButton.addEventListener('click', function () {
            addTaskToCompleted(bookObject.id);
        });

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('red');
        deleteButton.innerText = 'Hapus Buku';

        deleteButton.addEventListener('click', function () {
            removeTaskToCompleted(bookObject.id);
        });

        container.append(checkedButton, deleteButton);
    }

    return container;
}

// menampilkan buku yang sudah di input
function addTaskToCompleted(bookId){
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId){
    for (bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

// menghapus buku
function removeTaskToCompleted(bookId){
    const dialog = confirm ('apakah yakin ingin menghapus ?');
    if (dialog == true) {
        const bookTarget = findBookIndex(bookId);

        if (bookTarget === -1) return;

        books.splice(bookTarget, 1);
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

// mengembalikan buku 
function undoTaskFromCompleted(bookId){
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookIndex(bookId){
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

// membuat event hendler untuk RENDER data
document.addEventListener(RENDER_EVENT, function () {
    console.log(books);
    const uncompletedBookList = document.getElementById('incompleteBookshelfList');
    uncompletedBookList.innerHTML = '';

    // untuk memindahkan buku yg sudah dibaca
    const completeBookshelfList = document.getElementById('completeBookshelfList');
    completeBookshelfList.innerHTML = '';

    for (const bookItem of books){
        const bookElemet = makeBookshelf(bookItem);

        if (!bookItem.isCompleted) {
            uncompletedBookList.append(bookElemet);
        } else {
            completeBookshelfList.append(bookElemet);
        }
    }
});

// mencari buku
document.getElementById('searchBook').addEventListener('submit', function (event) {
    event.preventDefault();

    const bookSearch = document.getElementById('searchBookTitle').value.toLowerCase();
    const bookList = document.querySelectorAll('.book_item');

    for (let book of bookList) {
        const titleBook = book.firstElementChild.innerText.toLowerCase();
        if (titleBook.includes(bookSearch)) {
            book.style.display = "block";
        } else {
            book.style.display = "none";
        }
    }
});

// melakukan penyimpanan data ke localStorage
function saveData(){
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_BOOK, parsed);
        document.dispatchEvent(new Event(SAVED_NEW_EVENT));
    }
}

function isStorageExist(){
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local Storage');
        return false;
    }
    return true;
}

function loadDataFromStorage(){
    const ambilData = localStorage.getItem(STORAGE_BOOK);
    let data = JSON.parse(ambilData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}
