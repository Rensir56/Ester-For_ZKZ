export interface figureInfo {
    figurePath :string;
    figureName :string;
}
export interface message {
    username : string ; // usr, hisFig(zkz,...)
    avatarPath : string; //
    flag: number;  // 1 for user, 0 for gpt 
    type: 'text' | 'voice' | 'video'; // text audio video
    data : string; // reserved for mp3 and mp4 and text
    time : number; // send time
}
