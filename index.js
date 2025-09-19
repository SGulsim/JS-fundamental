let tasks = [];
let completedTaskCount = 0;
let completedTasks = [];

function showTasks() {
	if (tasks.length === 0) {
		console.log('Задачи не были добавлены или они отсутствуют');
		return;
	}

	tasks.forEach((task, index) => {
		console.log(`Задача №${index + 1}: ${task.title}
		Описание: ${task.description}
		Статус: ${task.isCompleted ? 'Выполнена' : 'Не выполнена'}
		Дата создания: ${task.createdDate.toLocaleDateString()}
		${
			task.isCompleted
				? `Дата выполнения: ${task.completedDate.toLocaleDateString()}`
				: ''
		}
		`);
	});
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
	if (index >= 0 && index < tasks.length && !tasks[index].isCompleted) {
		tasks = tasks.map((task, i) => {
			if (i === index) {
				const completedTask = {
					...task,
					isCompleted: true,
					completedDate: new Date(),
				};
				completedTasks.push(completedTask);
				completedTaskCount++;
				return completedTask;
			}
			return task;
		});
		console.log(`Задача "${tasks[index].title}" выполнена`);
	} else if (tasks[index]?.isCompleted) {
		console.log('Задача уже выполнена');
	} else {
		console.log('Задачи под таким индексом нет');
	}
}

function deleteTask(index) {
	if (index >= 0 && index < tasks.length) {
		if (!tasks[index].isCompleted) {
			const response = confirm(`Таска еще не выполнена, удалить?`);
			if (!response) return 'Удаление приостановлено';
		}
		tasks.splice(index, 1);
		console.log(`Задача под индексом: ${index} была удалена.`);
	} else {
		console.log('Задачи под таким индексом нет');
	}
}

function clearTasks() {
	tasks = [];
	return `Все задачи были очищены`;
}

function clearShortTasks() {
	tasks = tasks.filter(task => task.title.length >= 5);
}

function getTaskDescriptions() {
	return tasks.map(task => task.description);
}

function getLongTasks() {
	return tasks.filter(task => task.title.length > 10);
}

function getTasksByDateRange(startDate, endDate, isCompleted = false) {
	return tasks.filter(task => {
		const taskDate = task.createdDate;
		const dateInRange = taskDate >= startDate && taskDate <= endDate;

		if (isCompleted) {
			return dateInRange && task.isCompleted;
		}
		return dateInRange;
	});
}

function updateTaskTitle(index, newTitle) {
	if (index >= 0 && index < tasks.length) {
		tasks = tasks.map((task, i) =>
			i === index ? { ...task, title: newTitle } : task
		);
		return true;
	}
	return false;
}
// быстрый тест:
// function quickTest() {
// 	console.log('ТЕСТ');

// 	setTask('Задача 1', 'Описание 1');
// 	setTask('Длинная задача123', 'Описание 2');
// 	setTask('Тест', 'Короткая');

// 	console.log('\nВсе задачи:');
// 	showTasks();

// 	console.log('\nОписания:', getTaskDescriptions());
// 	console.log(
// 		'Длинные задачи:',
// 		getLongTasks().map(t => t.title)
// 	);

// 	completeTask(0);
// 	clearShortTasks();

// 	console.log('\nПосле операций:');
// 	showTasks();

// 	clearTasks();
// }

// quickTest();
