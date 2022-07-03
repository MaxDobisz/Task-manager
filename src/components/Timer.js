import React from 'react';
import PropTypes from 'prop-types';

class Timer extends React.Component {
    toHHMMSS() {
        const {time} = this.props;
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

    render() {
        return (
            <div className='timer'>{this.toHHMMSS()}</div> 
        );
    }
}

Timer.propTypes = {
    time: PropTypes.number.isRequired,
}

export default Timer;