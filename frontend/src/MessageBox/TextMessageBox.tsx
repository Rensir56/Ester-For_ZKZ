``
import {message} from "../interfaces.ts";
import "./TextMessageBox.css"
import {Avatar} from "antd";

export function TextMessageBox(props : message) {
    const isZero = (num: number) => (num < 10 ? '0' : '') + num;

    const getDateTime = (timestamp:number): string => {
        const datetime = new Date(timestamp);
        const year = datetime.getFullYear();
        const month = isZero(datetime.getMonth() + 1);
        const day = isZero(datetime.getDate());
        const hour = isZero(datetime.getHours());
        const minute = isZero(datetime.getMinutes());
        const seconds = isZero(datetime.getSeconds());
        return `${year}/${month}/${day} ${hour}:${minute}:${seconds}`;
    };

    const sender = props.username + '  ' + getDateTime(props.time);

    if (props.flag === 0) {
        return (
            <div className="container left">
                <Avatar src={props.avatarPath} className="avatar"></Avatar>
                <div className="Message0">
                    <div className="McontentWrapper0">
                        <span className="sender-name0">{sender}</span>
                        <div className="Mcontent0">
                            <span>{props.data}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div className="container right">
                <div className="Message1">
                    <div className="McontentWrapper1">
                        <span className="sender-name1">{sender}</span>
                        <div className="Mcontent1">
                            <span>{props.data}</span>
                        </div>
                    </div>
                </div>
                <Avatar src={props.avatarPath} className="avatar"></Avatar>
            </div>
        );
    }       
}