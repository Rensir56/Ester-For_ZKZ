import {message} from "../interfaces.ts";
import {TextMessageBox} from "./TextMessageBox.tsx";


export function MessageBox (mes :message){
    return (
        <>
            <div className="messageContainer">
               
               <div className="dataContainer">
                   {
                       mes.type == "text" ?
                       (<div className="textMessage">
                            <TextMessageBox
                                username={mes.username}
                                avatarPath={mes.avatarPath}
                                flag={mes.flag}
                                type={mes.type}
                                data={mes.data}
                                time={mes.time}
                            />
                       </div>) : mes.type == "audio" ?
                       (<div className="audioMessage">
                           //TODO
                       </div>) :
                       (<div className="videoMessage">
                           //TODO
                       </div>)

                   }
               </div>
            </div>
        </>
    )
}