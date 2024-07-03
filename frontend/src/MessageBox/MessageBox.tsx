import {message} from "../interfaces.ts";
import {TextMessageBox} from "./TextMessageBox.tsx";
import {Avatar} from "antd";

export function MessageBox ({mes} : {mes : message}){
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

    return (
        <>
            <div className="messageContainer">
               <Avatar src={mes.avatarPath} ></Avatar>
               <div className="dataContainer">
                   {
                       mes.type == "text" ?
                       (<div className="textMessage">
                            <TextMessageBox words={mes.data}></TextMessageBox>
                       </div>) : mes.type == "audio" ?
                       (<div className="audioMessage">
                           //TODO
                       </div>) :
                       (<div className="videoMessage">
                           //TODO
                       </div>)

                   }
               </div>
                <div className="messageTimeContainer">
                    {getDateTime(mes.time)}
                </div>
            </div>
        </>
    )
}