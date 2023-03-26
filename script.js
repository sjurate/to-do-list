const form = document.querySelector(".form");
const listContainer = document.querySelector(".list");
const inputDescription = document.querySelector(".form__input--description");
const inputTime = document.querySelector(".form__input--time");
const addBtn = document.querySelector(".add__btn");
const newestSort = document.querySelector(".sort__byDate");
const completedSort = document.querySelector(".sort__byCompleted");
const leastTimeLeftSort = document.querySelector(".sort__byTimeLeft");

class Task {
  description;
  dateTaskCreated;
  deadline = null;
  timeLeft;
  completed = 0;

  constructor(description, dateTaskCreated, deadline = null) {
    this.description = description;
    this.deadline = deadline;
    this.dateTaskCreated = dateTaskCreated;
  }
}

class App {
  list = [];
  dateNow;

  constructor() {
    this.dateNow = Date.now();
    addBtn.addEventListener("click", this.addTask.bind(this));
    this.getLocalStorage();
    this.updateList(this.list);
    newestSort.addEventListener("click", this.sortByDate.bind(this));
    completedSort.addEventListener("click", this.sortByCompleted.bind(this));
    leastTimeLeftSort.addEventListener("click", this.sortByTimeLeft.bind(this));
  }

  addTask(e) {
    e.preventDefault();

    const description = inputDescription.value;
    const deadlineInput = inputTime.value;
    let deadline;
    if (!deadlineInput) {
      deadline = Infinity;
    } else {
      deadline = Number(new Date(deadlineInput));
    }
    const dateTaskCreated = Date.now();

    if (this.validateInput(description, deadline, dateTaskCreated)) {
      let task = new Task(description, dateTaskCreated, deadline);
      const updatedList = [...this.list, task];
      this.updateList(updatedList);
    } else {
      return;
    }

    inputDescription.value = "";
    inputTime.value = "";
  }

  deleteTask(e) {
    e.preventDefault();
    const answer = confirm("Are you sure you want to delete this task?");
    if (answer == false) {
      return;
    }
    const dateTaskCreated = e.target.attributes.data.value;
    const updatedList = this.list?.filter(
      (item) => +item.dateTaskCreated !== +dateTaskCreated
    );
    this.updateList(updatedList);
  }

  completeTask(e) {
    e.preventDefault();
    const dateTaskCreated = e.target.attributes.data.value;
    const updatedList = this.list.map((item) =>
      +item.dateTaskCreated === +dateTaskCreated
        ? { ...item, completed: true }
        : { ...item }
    );

    this.updateList(updatedList);
  }

  renderTasks(tasks) {
    let html = ``;

    for (let task of tasks) {
      const completed = task?.completed
        ? "completed__true"
        : "completed__false";
      const check = task?.completed ? "check" : "";
      let displayedLeft;
      if (task.timeLeft !== Infinity) {
        displayedLeft = this.calcTimeLeft(Math.round(task.timeLeft));
      } else {
        displayedLeft = "";
      }

      html += `
      <li class="single__task ">
      <div class="single__task__info ${completed}">
        <div class="description">${task.description}</div>
        <div>${displayedLeft}</div>
      </div>
        <div class="single__task__btns">
          
          <button class="delete__btn" data=${task.dateTaskCreated} >Delete
          </button>
          <div class="check-container complete__btn" >
            <input   type="checkbox" dateTaskCreated="done" name="done" />
            <span class="checkmark ${check}" data=${task.dateTaskCreated}></span>
          </div>
        </div>
      </li> 
      `;
    }

    listContainer.innerHTML = html;
  }

  getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("tasks"));
    if (!data) return;
    for (let item of data) {
      if (item.deadline !== Infinity && item.deadline !== null) {
        item.timeLeft = item.deadline - Date.now();
      } else {
        item.timeLeft = Infinity;
      }
    }
    this.list = data;
  }

  updateList(updatedList) {
    localStorage.setItem("tasks", JSON.stringify(updatedList));
    this.getLocalStorage();
    this.renderTasks(this.list);

    const completeBtns = document.querySelectorAll(".complete__btn");
    const deleteBtns = document.querySelectorAll(".delete__btn");
    completeBtns.forEach((btn) =>
      btn.addEventListener("click", this.completeTask.bind(this))
    );
    deleteBtns.forEach((btn) =>
      btn.addEventListener("click", this.deleteTask.bind(this))
    );
  }

  sortByDate() {
    const updatedList = this.list.sort(
      (item1, item2) => item2.dateTaskCreated - item1.dateTaskCreated
    );
    this.updateList(updatedList);
  }

  sortByCompleted() {
    const updatedList = this.list.sort(
      (item1, item2) => item2.completed - item1.completed
    );
    this.updateList(updatedList);
  }

  sortByTimeLeft() {
    const updatedList = this.list.sort(
      (item1, item2) => item1.timeLeft - item2.timeLeft
    );
    this.updateList(updatedList);
  }

  validateInput(description, deadline, dateTaskCreated) {
    if (description.length < 1) {
      alert("Task can't be empty!");
      return false;
    }
    if (description.length > 160) {
      alert("Task can't be longer than 160 symbols");
      return false;
    }
    if (deadline < dateTaskCreated && deadline !== Infinity) {
      alert("Deadline can't be set for past time");
      return false;
    }
    return true;
  }

  calcTimeLeft(time) {
    if (time / (1000 * 60 * 60 * 24) > 31) {
      return `Time left: ${Math.round(
        time / (1000 * 60 * 60 * 24 * 31)
      )} months`;
    }
    if (time / (1000 * 60 * 60) > 24) {
      return `Time left: ${Math.round(time / (1000 * 60 * 60 * 24))} days`;
    }
    if (time / (1000 * 60 * 60) > 1) {
      return `Time left: ${Math.round(time / (1000 * 60 * 60))} hours`;
    } else {
      return `Time left: ${Math.round(time / (1000 * 60))} minutes`;
    }
  }
}

const app = new App();
