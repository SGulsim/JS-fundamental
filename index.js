let tasks = [];
let completedTaskCount = 0;
let completedTasks = [];

function showTask() {
	if (tasks.length === 0) {
		console.log(`Задачи не было добавлены или они отсутствуют`);
	}
	if (tasks.length > 0) {
		tasks.forEach((task, index) => {
			console.log(`Задача №${index + 1}: ${task.title}
    Описание: ${task.description}
    Статус: ${task.isCompleted ? 'Выполнена' : 'Не выполнена'}
    `);
		});
	}
}

function setTask(taskTitle, taskDescription) {
	if (taskTitle && taskDescription) {
		const newTask = {
			title: taskTitle,
			description: taskDescription,
			isCompleted: false,
			createdDate: new Date(),
			completedDate: null,
		};
		tasks.push(newTask);
		console.log(`Задача ${taskTitle} добавлена в список.`);
	}
}

function completeTask(index) {
	if (index >= 0 && index < tasks.length) {
		if (!tasks[index].isCompleted) {
			tasks[index].isCompleted = true;
			tasks[index].completedDate = new Date();
			completedTasks.push(tasks[index]);
			completedTaskCount++;
			console.log(`Задача "${tasks[index].title}" выполнена`);
		} else {
			console.log('Задача уже выполнена');
		}
	} else {
		console.log(
			'Задачи под таким индексом нет или некорректен передаваемый индекс'
		);
	}
}

function deleteTask(index) {
	if (index >= 0 && index < tasks.length) {
		if (!tasks[index].isCompleted) {
			const response = confirm(`Таска еще не выполнена, удалить?`);

			if (!response) {
				return 'Удаление приостановлено';
			}
		}

		tasks.splice(index, 1);
		console.log(`Задача под индексом: ${index} была удалена.`);
	} else {
		console.log(
			'Задачи под таким индексом нет или некорректен передаваемый индекс'
		);
	}
}

function clearTasks() {
	tasks = [];
	return `Все задачи были очищены`;
}

setTask('Пройти раздел про this', 'this, методы объекта, конструктор объектов');
setTask('Сделать домашку', 'По разделу F2');
showTask();
completeTask(0);
showTask();
// deleteTask(1);
// clearTasks();
