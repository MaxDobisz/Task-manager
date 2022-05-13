import React from 'react';

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
        fetch(this.apiUrl)
            .then(resp => resp.json())
            .then(resp => this.setState({tasks: resp}))
            .catch(err => console.log(err));
    }

    componentWillUnmount() {
       clearInterval(this.idTime)
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
            .finally(() => this.clearInput())
    }

    createTask() {
        const {task} = this.state;
        const data = {name: task, time: 0, isRunning: false, isDone: false, isRemoved: false};

        return data;
    }

    clearInput() {
        this.setState({task: ''})
    }

    inputChange = e => this.setState({task: e.target.value});
        
    renderTasks() {
        const {tasks} = this.state
        if(tasks) {
            const sortedTasks = this.sortTasks()

            return sortedTasks.map((task) => {
                return (
                    <li className='items-list__item'>
                        <section className='item__section'>
                            <header className='item__header'>
                                <h2 className='item__title'>{task.name}</h2>
                                <div className='item__timer'>{this.toHHMMSS(task.time)}</div> 
                            </header>
                            <footer className='item__footer'>
                                <button className='item__button' disabled={this.disableStartStopButton(task)} onClick={() =>{this.startStopHandler(task)}}>{this.startStopToggle(task.isRunning)}</button>
                                <button className='item__button' disabled={this.disableFinishButton(task.isDone)} onClick={() => {this.finishTaskHandler(task)}}>finish</button>
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
                if(!a.isDone && b.isDone) {
                    return -1;
                }
        });

        return sortedTasks;
    }

    toHHMMSS (time) {
        var sec_num = parseInt(time, 10);
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);
    
        if(hours < 10) {
            hours = "0" + hours;
        }
        if(minutes < 10) {
            minutes = "0" + minutes;
        }
        if(seconds < 10) {
            seconds = "0" + seconds;
        }

        return `${hours}:${minutes}:${seconds}`;
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
            clearInterval(this.idTime);
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

    finishTaskHandler(task) {
        if (task.isRunning === true) {
            clearInterval(this.idTime);
        }
        
        this.setState(state => {
            const newTasks = state.tasks.map(item=> {
                if(task.id === item.id) {
                    const updatedTask = {...item, isRunning: false, isDone: true}
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
        this.idTime = '';
    }
}

export default TasksManager;