import React from 'react';
import Timer from './Timer';

class TasksManager extends React.Component {
    apiUrl = 'http://localhost:3005/data'
    idTime = null;
    state = {
        tasks: null,
        task:'',
    }

    render() {
        const {task} = this.state;

        return (
            <div className='task-manager'>
                <h1 className='task-manager__title'>TASK MANAGER</h1>
                <form className='task-manager__form' onSubmit={this.onSubmit}>
                    <input className='form__submit form__submit--input' name='task' value={task} onChange={this.inputChange}/>
                    <input className='form__submit form__submit--button' type='submit'/>
                </form>
                <ul className='task-manager__items-list'>{this.renderTasks()}</ul>
            </div>
        )
    }

    componentDidMount() {
        window.addEventListener("beforeunload", this.onUnload);
        fetch(this.apiUrl)
            .then(resp => resp.json())
            .then(resp => this.setState({tasks: resp}))
            .catch(err => console.log(err));
    }

    componentWillUnmount() {
        this.clearTimer();
        window.removeEventListener("beforeunload", this.onUnload);
    }

    onUnload = e => { 
        e.preventDefault();
        const tasks = [...this.state.tasks];
        const runningTask = tasks.find(task => task.isRunning === true);
        const stopedTask = {...runningTask, isRunning: false};
        this.updateData(stopedTask);
    }

    onSubmit = (e) => {
        e.preventDefault();
        const task = this.createTask();

        const options = {
            method: 'POST',
            body: JSON.stringify(task),
            headers: {"Content-Type": "application/json"},
        }
        
        fetch(this.apiUrl, options)
            .then(resp => resp.json())
            .then(resp => {
                const {tasks} = this.state;
                const newTasks = [...tasks, resp];
                this.setState({tasks: newTasks});
            })
            .catch(err => console.log(err))
            .finally(() => this.clearInput());
    }

    createTask() {
        const {task} = this.state;
        const data = {name: task, time: 0, isRunning: false, isDone: false, isRemoved: false};

        return data;
    }

    clearInput() {
        this.setState({task: ''});
    }

    inputChange = e => this.setState({task: e.target.value});
        
    renderTasks() {
        const {tasks} = this.state;
        if(tasks) {
            const sortedTasks = this.sortTasks();

            return sortedTasks.map((task) => {
                return (
                    <li className='items-list__item'>
                        <section className='item__section'>
                            <header className='item__header'>
                                <h2 className='item__title'>{task.name}</h2>
                                <Timer time= {task.time}/>
                            </header>
                            <footer className='item__footer'>
                                <button className='item__button' disabled={this.disableStartStopButton(task)} onClick={() =>{this.startStopHandler(task)}}>{this.startStopToggle(task.isRunning)}</button>
                                <button className='item__button' disabled={this.disableFinishButton(task.isDone)} onClick={(e) => {

                                    this.finishTaskHandler(task, e)}}>finish</button>
                                <button className='item__button' disabled={this.disableRemoveButton(task.isDone)} onClick={() => {this.removeTaskHandler(task)}}>remove</button>
                            </footer>
                        </section>
                    </li>
                )
            })
        }
    }

    sortTasks() {
        const {tasks} = this.state;
        const unremovedTasks = tasks.filter(task => task.isRemoved === false);
        const sortedTasks = unremovedTasks.sort((a, b) => {
            if (!a.finishTime && b.finishTime) {
                return -1;
            }

            return   a.finishTime-b.finishTime;
        });

        return sortedTasks;
    }

    disableStartStopButton(task) {
        if(task.isDone || this.idTime && !task.isRunning) {
            return true;
        }

        return false;
    }

    startStopHandler(task) {
        if(!this.idTime) {
            this.idTime = setInterval(()=>{this.incrementTime(task.id)}, 1000);
        } else {
            this.clearTimer();
            const tasks = [...this.state.tasks];
            const newTasks = tasks.map(item=> {
                if(task.id === item.id) {
                    const updatedTask = {...item, time: task.time + 1, isRunning: false}
                    this.updateData(updatedTask);

                    return updatedTask;
                }

                return item;
            });

            this.setState({tasks: newTasks});
        }
    }

    incrementTime(taskId) {
        const tasks = [...this.state.tasks];
        const newTasks = tasks.map(task => {
            if(task.id === taskId) {
                const updatedTask = {...task, time: task.time + 1, isRunning: true};
                this.updateData(updatedTask);

                return updatedTask;
            }

            return task;
        });

        this.setState({tasks: newTasks});
    }

    startStopToggle(taskIsRunning) {
        if(taskIsRunning && this.idTime) {
            return 'stop';
        }

        return 'start';
    }

    disableFinishButton(taskIsDone) {
        if(taskIsDone) {
            return true;
        } 

        return false;
    }

    finishTaskHandler(task, event) {
        if (task.isRunning === true) {
            this.clearTimer();
        }
        
        this.setState(state => {
            const newTasks = state.tasks.map(item=> {
                if(task.id === item.id) {
                    const updatedTask = {...item, isRunning: false, isDone: true, finishTime: event.timeStamp}
                    this.updateData(updatedTask);

                    return updatedTask;
                }

                return item;
            });

            return {
                tasks: newTasks,
            }
        });
    }

   disableRemoveButton(taskIsDone) {
        if(taskIsDone) {
            return false;
        } 

        return true;
    }

    removeTaskHandler(task) {
        const tasks = [...this.state.tasks]
        const newTasks = tasks.map(item => {
            if(task.id === item.id && task.isDone === true) {
                const updatedTask = {...item, isRemoved: true};
                this.updateData(updatedTask);

                return updatedTask;
            }

            return item;
        });

        this.setState({tasks: newTasks});
    }

    updateData(task) {
        const {id} = task;
        const options = {
            method:'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        }

        fetch(`http://localhost:3005/data/${id}`, options)
            .catch(error => console.error(error));
    }

    clearTimer() {
        clearInterval(this.idTime);
        this.idTime = '';
    }
}

export default TasksManager;