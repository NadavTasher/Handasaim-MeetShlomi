<?php
// Init Vars
$result = new stdClass();
$settings = json_decode(file_get_contents('../files/settings.json'));
$dbFile = '../files/database.json';
$db = json_decode(file_get_contents($dbFile));
// Main
main();
// Functions
function main()
{
    global $result;
    if (isset($_POST["id"])) {
        // User Actions
        $id = $_POST["id"];
        if (isRegistered($id)) {
            if (isset($_POST["data"])) {
                $data = $_POST["data"];
                $result->meeting = createMeeting($id, $data);
            } else {
                $result->user = loadUser($id);
            }
        } else {
            if (isset($_POST["data"])) {
                $data = $_POST["data"];
                $result->user = createUser($data);
            }
        }
    } else if (isset($_POST["date"])) {
        $date=$_POST["date"];
        $result->slots=loadSlots($date);
    } else {
        $result->error = "Unknown Action";
    }
    echo json_encode($result);
}

function createMeeting($id, $data)
{
    global $db, $settings;
    $result = new stdClass();
    $date = $data->slot->date;
    $slot = $data->slot->slot;
    $occupied = isOccupied($slot, meetingsForDate($date));
    $inbounds = $slot >= $settings->start && $slot <= $settings->end;
    $create = !$occupied && $inbounds;
    if ($create) {
        $meetingId = generateMeetingId();
        $meeting = new stdClass();
        $meetingContent = new stdClass();
        $meetingSlot = new stdClass();
        $meetingSlotDate = new stdClass();
        $meetingSlotDate->day = $date->day;
        $meetingSlotDate->month = $date->month;
        $meetingSlotDate->year = $date->year;
        $meetingSlot->slot = $slot;
        $meetingSlot->date = $meetingSlotDate;
        $meetingContent->reason = $data->content->reason;
        $meeting->slot = $meetingSlot;
        $meeting->state = "pending";
        $meeting->content = $meetingContent;
        $meeting->id = $meetingId;
        // Add To User
        $users = $db->users;
        for ($u = 0; $u < sizeof($users); $u++) {
            if ($users[$u]->id === $id) {
                array_push($users[$u]->meetings, $meetingId);
            }
        }
        $db->users = $users;
        // Add To Meeting Array
        $meetings = $db->meetings;
        array_push($meetings, $meeting);
        $db->meetings = $meetings;
        save();

    }
    $result->created = $create;
    return $result;
}

function isOccupied($slot, $occupied)
{
    for ($m = 0; $m < sizeof($occupied); $m++) {
        if ($occupied[$m]->slot->slot === $slot && $occupied[$m]->state !== "denied") return true;
    }
    return false;
}

function meetingsForDate($date)
{
    global $db;
    $result = array();
    $meetings = $db->meetings;
    for ($m = 0; $m < sizeof($meetings); $m++) {
        $currentMeetings = $meetings[$m];
        if ($currentMeetings->date->day === $date->day && $currentMeetings->date->month === $date->month && $currentMeetings->date->year === $date->year) {
            array_push($result, $currentMeetings);
        }
    }
    return $meetings;
}

function loadSlots($date){
    global $settings;
    $result=new stdClass();
    $result->slot=$settings->slot;
    $occupiedSlots=meetingsForDate($date);
    $emptySlots=array();
    for($s=$settings->start;$s<$settings->end;$s++){
        if(!isOccupied($s,$occupiedSlots)){
            array_push($emptySlots,$s);
        }
    }
    $result->slots=$emptySlots;
    return $result;
}

function loadUser($id)
{
    global $db;
    $users = $db->users;
    $user = new stdClass();
    for ($i = 0; $i < sizeof($users); $i++) {
        $currentUser = $users[$i];
        if ($currentUser->id === $id) {
            $user->name = $currentUser->name;
            $user->phone = $currentUser->phone;
            $user->meetings = $currentUser->meetings;
        }
    }
    return $user;
}

function createUser($data)
{
    global $db;
    $result = new stdClass();
    $id = generateUserId();
    $seed = rand(10000000, 99000000);
    $user = new stdClass();
    $user->id = $id;
    $user->seed = $seed;
    $user->name = $data->name;
    $user->phone = $data->phone;
    $user->type = $data->type;
    $user->status = "standard";
    $user->meetings = [];
    // Write To Result
    $result->id = $id;
    $result->seed = $seed;
    // Write To Userbase
    $users = $db->users;
    array_push($users, $user);
    $db->users = $users;
    // Write Userbase
    save();
    return $result;
}

function isRegistered($id)
{
    global $userbase;
    $users = $userbase->users;
    for ($i = 0; $i < sizeof($users); $i++) {
        if ($users[$i]->id === $id) return true;
    }
    return false;

}

function generateMeetingId()
{
    global $db;
    $meetings = $db->meeting;
    $id = null;
    while ($id === null) {
        $random = rand(1, 100000);
        for ($i = 0; $i < sizeof($meetings) && $id === null; $i++) {
            if ($meetings[$i]->id !== $id) $id = $random;
        }
    }
    return $id;
}

function generateUserId()
{
    global $db;
    $users = $db->users;
    $id = null;
    while ($id === null) {
        $random = rand(1, 10000);
        for ($i = 0; $i < sizeof($users) && $id === null; $i++) {
            if ($users[$i]->id !== $id) $id = $random;
        }
    }
    return $id;
}

function save()
{
    global $db, $dbFile;
    file_put_contents($dbFile, json_encode($db));
}