let task = '';
let completedTaskCount = 0;

function showTask() {
	console.log(task ? `Задача на данный момент: ${task}` : 'Задача отсутствует');
}

function setTask(taskDescription) {
	if (task === '') {
		task = taskDescription;
		console.log(`Новая задача: ${task}`);
	} else {
		console.log('Не могу добавить задачу, завершите или удалите предыдущую');
	}
}

function completeTask() {
	if (task) {
		console.log(`Задача выполнена: ${task}`);
		task = '';
		completedTaskCount += 1;
	}
}

function deleteTask(taskDescription = '') {
	task = '';
}
