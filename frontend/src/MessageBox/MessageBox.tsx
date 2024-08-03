import {message} from "../interfaces.ts";
import { MessageItem } from "./MessageItem.tsx";
import {Avatar} from "antd";
import "./MessageBox.css"

export function MessageBox (props :message){
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
    return (
        <>
            <div className="messageContainer">
               <div className="dataContainer">
               {props.flag === 0?
                    (<div className="container left">
                        <Avatar src={props.avatarPath} className="avatar"></Avatar>
                        <div className="Message0">
                            <div className="McontentWrapper0">
                                <span className="sender-name0">{sender}</span>
                                <div className="Mcontent0">
                                    <MessageItem
                                        data = {props.data}
                                        type = {props.type}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>):
                    (<div className="container right">
                        <div className="Message1">
                            <div className="McontentWrapper1">
                                <span className="sender-name1">{sender}</span>
                                <div className="Mcontent1">
                                    <MessageItem
                                        data = {props.data}
                                        type = {props.type}
                                    />
                                </div>
                            </div>
                        </div>
                        <Avatar src={props.avatarPath} className="avatar"></Avatar>
                    </div>)
                }
               </div>
            </div>
        </>
    )
}