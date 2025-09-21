let userTasks = new Map();
let uniqueCategories = new Set();
let completedTasks = [];

function showUserTasks(userId) {
	const userTasksArray = userTasks.get(userId) || [];

	if (userTasksArray.length === 0) {
		return `Пользователь ${userId} не имеет задач`;
	}

	const completedCount = userTasksArray.filter(task => task.isCompleted).length;

	return userTasksArray
		.map(task => {
			const {
				userId: uid,
				title,
				description,
				category,
				isCompleted,
				createdDate,
				completedDate,
			} = task;

			return `
Задача: ${title} 
Пользователь: ${userId}
Описание: ${description}
Категория: ${category}
Статус: ${isCompleted ? 'Выполнена' : 'Не выполнена'}
Количество выполненных задач: ${completedCount}
Дата создания: ${createdDate.toLocaleDateString()}
${isCompleted ? `Дата выполнения: ${completedDate.toLocaleDateString()}` : ''}`;
		})
		.join('\n\t\t');
}

function setTask(userId, ...newTasksArray) {
	if (!userTasks.has(userId)) {
		userTasks.set(userId, []);
	}

	const userTasksArray = userTasks.get(userId);

	newTasksArray.forEach(taskData => {
		const { title, description, category = '', ...rest } = taskData;

		if (!title) {
			throw new Error('Задача должна иметь заголовок');
		}

		const newTask = {
			userId: parseInt(userId),
			title,
			description: description ?? 'Отсутствует описание',
			category,
			isCompleted: false,
			createdDate: new Date(),
			completedDate: null,
			completedTaskCount: 0,
			...rest,
		};

		userTasksArray.push(newTask);
		uniqueCategories.add(category);
		console.log(`Задача "${title}" добавлена пользователю ${userId}`);
	});
	userTasks.set(userId, userTasks.get(userId));
}

function completeUserTask(userId, index) {
	const userTasksArray = userTasks.get(userId);

	if (!userTasksArray || index < 0 || index >= userTasksArray.length) {
		throw new Error('Задачи под таким индексом нет');
	}

	if (userTasksArray[index]?.isCompleted) {
		return `Задача уже выполнена пользователем ${userId}`;
	}

	const completedBefore = userTasksArray.filter(
		task => task.isCompleted
	).length;
	const completedAfter = completedBefore + 1;

	const updatedTask = {
		...userTasksArray[index],
		isCompleted: true,
		completedDate: new Date(),
		completedTaskCount: completedAfter,
	};

	userTasksArray[index] = updatedTask;

	userTasksArray.forEach(task => (task.completedTaskCount = completedAfter));

	userTasks.set(userId, userTasksArray);

	completedTasks.push(updatedTask);

	return `Задача "${updatedTask.title}" выполнена`;
}

function deleteTask(userId, index) {
	const userTasksArray = userTasks.get(userId) || [];

	if (!userTasksArray || index < 0 || index >= userTasksArray.length) {
		throw new Error('Задачи под таким индексом нет');
	}

	const task = userTasksArray[index];

	!task.isCompleted &&
		!confirm(`Таска еще не выполнена, удалить?`) &&
		(console.log('Удаление приостановлено') || userTasksArray);

	const updatedArray = [
		...userTasksArray.slice(0, index),
		...userTasksArray.slice(index + 1),
	];

	userTasks.set(userId, updatedArray);
	console.log(`Задача "${task.title}" удалена`);

	return updatedArray;
}

function clearTasks(userId) {
	userTasks.set(userId, []);
	return `Все задачи были очищены`;
}

function clearShortTasks() {
	for (const [uid, tasks] of userTasks.entries()) {
		const filtered = tasks.filter(task => task.title && task.title.length >= 5);
		userTasks.set(uid, filtered);
	}
}

function getTaskDescriptions(userId) {
	const userTasksArray = userTasks.get(userId) || [];
	return userTasksArray.map(userTask => userTask.description);
}

function getLongTasks() {
	const result = [];
	for (const tasks of userTasks.values()) {
		result.push(...tasks.filter(task => task.title && task.title.length > 10));
	}
	return result;
}

function getTasksByDateRange(userId, startDate, endDate, isCompleted = false) {
	const userTasksArray = userTasks.get(userId) || [];
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

function updateTaskTitle(userId, index, newTitle) {
	const userTasksArray = userTasks.get(userId) || [];

	if (!userTasksArray || index < 0 || index >= userTasksArray.length) {
		throw new Error('Задачи под таким индексом нет');
	}

	const updated = userTasksArray.map((userTask, i) =>
		i === index ? { ...userTask, title: newTitle } : userTask
	);

	userTasks.set(userId, updated);
}

function getUniqueCategories() {
	return Array.from(uniqueCategories);
}

function exportTasksToJSON(userId) {
	const userTasksArray = userTasks.get(userId) || [];
	return JSON.stringify(userTasksArray, null, 2);
}

function importTasksFromJSON(userId, jsonString) {
	try {
		const importedTasks = JSON.parse(jsonString);

		if (!Array.isArray(importedTasks)) {
			throw new Error('Некорректный формат JSON: ожидается массив');
		}

		importedTasks.forEach(task => {
			if (!task.userId) {
				throw new Error('Задача должна быть закреплена за пользователем');
			}
			if (!task.category) {
				throw new Error('Задача должна иметь категорию');
			}
			if (!task.title) {
				throw new Error('Задача должна иметь заголовок');
			}
		});

		userTasks.set(userId, importedTasks);
		return importedTasks;
	} catch (error) {
		console.error('Ошибка импорта:', error.message);
		throw error;
	}
}
