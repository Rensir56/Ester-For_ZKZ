import {figureInfo} from "../interfaces.ts";
import {FigureCard} from "../historicalFigure/historicalFigure.tsx";
import "./leftLayout.css"
export  function  LeftLayout({figures, curFig, chooseFig}:{figures:figureInfo[], curFig : any, chooseFig : any}) {
   return (
        <>
            <div className="left_layout">
                {figures.map((figure,index) => (
                    <div style={{backgroundColor: index == curFig ? "cyan" : "transparent"}} onClick={()=>chooseFig(index)}>
                        <FigureCard key={index} figure={figure}/>
                    </div>
                ))}
            </div>
        </>
    );
}