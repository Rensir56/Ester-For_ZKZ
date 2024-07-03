export interface figureInfo {
    figurePath :string;
    figureName :string;
}
export interface message {
    username : string ; // usr, hisFig(zkz,...)
    avatarPath : string //
    type: 'text' | 'audio' | 'video'; // text audio video
    data : string; // reserved for mp3 and mp4 and text
    time : number; // send time
}
