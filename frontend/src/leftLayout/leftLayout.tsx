import {figureInfo} from "../interfaces.ts";
import {FigureCard} from "../historicalFigure/historicalFigure.tsx";
import "./leftLayout.css"
export  function  LeftLayout({figures}:{figures:figureInfo[]}) {
   return (
        <>
            <div className="left_layout">
                {figures.map((figure,index) => (
                    <FigureCard key={index} figure={figure} />
                ))}
            </div>
        </>
    );
}