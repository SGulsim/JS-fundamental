let userTasks = new Map();
let uniqueCategories = new Set();
let completedTasks = [];

const validateTaskData = taskData => {
	if (!taskData.title?.trim()) {
		throw new Error('Задача должна иметь заголовок');
	}
};

const validateUserAndIndex = (userID, index) => {
	const userTasksArray = userTasks.get(userID);
	if (!userTasksArray || index < 0 || index >= userTasksArray.length) {
		throw new Error('Задачи под таким индексом нет');
	}
	return userTasksArray;
};

const generateID = (() => {
	let id = 0;
	return () => ++id;
})();

function createTaskObject(userID, taskData) {
	const { title, description, category = '', ...rest } = taskData;

	return {
		id: generateID(),
		userID: parseInt(userID),
		title: title.trim(),
		description: description?.trim() || 'Отсутствует описание',
		category: category?.trim() || '',
		isCompleted: false,
		createdDate: new Date(),
		completedDate: null,
		...rest,
	};
}

function showUserTasks(userID) {
	const userTasksArray = userTasks.get(userID) || [];

	if (userTasksArray.length === 0) {
		return `Пользователь ${userID} не имеет задач`;
	}

	const completedCount = userTasksArray.filter(task => task.isCompleted).length;

	return userTasksArray
		.map(task => {
			const status = task.isCompleted ? 'Выполнена' : 'Не выполнена';
			const completionDate = task.isCompleted
				? `\nДата выполнения: ${task.completedDate.toLocaleDateString()}`
				: '';

			return `Задача: ${task.title} 
Пользователь: ${userID}
Описание: ${task.description}
Категория: ${task.category}
Статус: ${status}
Количество выполненных задач: ${completedCount}
Дата создания: ${task.createdDate.toLocaleDateString()}${completionDate}`;
		})
		.join('\n\n');
}

function setTask(userID, ...newTasksArray) {
	if (!userTasks.has(userID)) {
		userTasks.set(userID, []);
	}

	const userTasksArray = userTasks.get(userID);

	const results = [];

	newTasksArray.forEach(taskData => {
		validateTaskData(taskData);

		const newTask = createTaskObject(userID, taskData);
		userTasksArray.push(newTask);

		if (newTask.category) {
			uniqueCategories.add(newTask.category);
		}

		results.push(notifyAssignment.call(newTask));
	});

	results.forEach(msg => console.log(msg));
	return userTasksArray;
}

function notifyAssignment() {
	return `Пользователь #${this.userID}. Задача: '${this.title}' была успешна добавлена в твой список.`;
}

function completeUserTask(userID, index) {
	const userTasksArray = validateUserAndIndex(userID, index);
	const task = userTasksArray[index];

	if (task.isCompleted) {
		return `Задача "${task.title}" уже выполнена`;
	}

	const updatedTask = {
		...task,
		isCompleted: true,
		completedDate: new Date(),
	};

	userTasksArray[index] = updatedTask;
	completedTasks.push(updatedTask);

	return `Задача "${task.title}" выполнена`;
}

function deleteTask(userID, index) {
	const userTasksArray = validateUserAndIndex(userID, index);
	const task = userTasksArray[index];

	if (!task.isCompleted) {
		const shouldDelete = confirm(`Задача "${task.title}" еще не выполнена. Удалить?`);
		if (!shouldDelete) {
			console.log('Удаление отменено');
			return userTasksArray;
		}
	}

	const updatedArray = userTasksArray.filter((_, i) => i !== index);
	userTasks.set(userID, updatedArray);

	console.log(`Задача "${task.title}" удалена`);
	return updatedArray;
}

function clearTasks(userID) {
	if (userTasks.has(userID)) {
		userTasks.set(userID, []);
	}
	return `Все задачи пользователя ${userID} очищены`;
}

function clearShortTasks() {
	for (const [uid, tasks] of userTasks.entries()) {
		const filtered = tasks.filter(task => task.title && task.title.length >= 5);
		userTasks.set(uid, filtered);
	}
}

function getTaskDescriptions(userID) {
	const userTasksArray = userTasks.get(userID) || [];
	return userTasksArray.map(userTask => userTask.description);
}

function getLongTasks() {
	const result = [];
	for (const tasks of userTasks.values()) {
		result.push(...tasks.filter(task => task.title.length > 10));
	}
	return result;
}

function getTasksByDateRange(userID, startDate, endDate, isCompleted = false) {
	const userTasksArray = userTasks.get(userID) || [];

	const userTasksArrayByDateRange = userTasksArray.filter(userTask => {
		const taskDate = userTask.createdDate;
		const dateInRange = taskDate >= startDate && taskDate <= endDate;

		if (isCompleted) {
			return dateInRange && userTask.isCompleted;
		}
		return dateInRange;
	});

	return userTasksArrayByDateRange;
}

function updateTaskTitle(userID, index, newTitle) {
	const userTasksArray = validateUserAndIndex(userID, index);

	if (!newTitle?.trim()) {
		throw new Error('Новый заголовок не может быть пустым');
	}

	userTasksArray[index] = {
		...userTasksArray[index],
		title: newTitle.trim(),
	};
}

function getUniqueCategories() {
	return Array.from(uniqueCategories).filter(Boolean);
}

function exportTasksToJSON(userID) {
	const userTasksArray = userTasks.get(userID) || [];
	return JSON.stringify(userTasksArray, null, 2);
}

function importTasksFromJSON(userID, jsonString) {
	try {
		const importedTasks = JSON.parse(jsonString);

		if (!Array.isArray(importedTasks)) {
			throw new Error('Некорректный формат JSON: ожидается массив');
		}

		importedTasks.forEach(task => {
			if (!task.userID) {
				throw new Error('Задача должна быть закреплена за пользователем');
			}
			if (!task.category) {
				throw new Error('Задача должна иметь категорию');
			}
			if (!task.title) {
				throw new Error('Задача должна иметь заголовок');
			}
		});

		userTasks.set(userID, importedTasks);
		return importedTasks;
	} catch (error) {
		console.error('Ошибка импорта:', error.message);
		throw error;
	}
}

function findTaskById(id) {
	for (let [userID, tasks] of userTasks.entries()) {
		const task = tasks.find(task => task.id === id);
		if (task) return task;
	}
	return null;
}

function remindAboutTask(id, seconds) {
	const task = findTaskById(id);
	if (!task) return `Задачи с id=${id} не существует`;

	setTimeout(() => {
		if (!task.isCompleted) {
			console.log(`Напоминание: задача "${task.title}" (id=${id}) все еще не выполнена.`);
		}
	}, seconds * 1000);
}

function countdownToDeadline(id, secondsToDeadline) {
	const task = findTaskById(id);
	if (!task) return `Задачи с id=${id} не существует`;

	console.log(`До дедлайна задачи "${task.title}" (id=${id}) осталось: ${secondsToDeadline} сек.`);

	let secondsLeft = secondsToDeadline;
	const timerID = setInterval(() => {
		secondsLeft--;
		if (secondsLeft > 0) {
			console.log(`Осталось: ${secondsLeft} сек.`);
		} else {
			clearInterval(timerID);
			console.log(`Дедлайн для задачи "${task.title}"!`);
		}
	}, 1000);
}
