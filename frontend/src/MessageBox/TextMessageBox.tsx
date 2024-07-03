``
export function TextMessageBox({words} : { words: string}) {
    return (
        <>
            <div className="text-message-box">
                {words}
            </div>
        </>
    )
}