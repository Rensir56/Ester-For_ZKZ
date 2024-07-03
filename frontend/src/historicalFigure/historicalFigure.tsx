import "./historoicalFigure.css"
import {figureInfo} from "../interfaces"
import {Image } from "antd"
export  function FigureCard({figure}: {figure: figureInfo}) {
    return (
        <>
            <div className="person_info">
                <div className="person_avatar">
                    <Image className="image" src={figure.figurePath} alt={"invalid avatar path"} preview={false}/>
                    <div className="person_name">
                        <strong>{figure.figureName}</strong>
                    </div>
                </div>
            </div>
        </>
    )
}
