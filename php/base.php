<?php
// Init Vars
$result = new stdClass();
$settings = json_decode(file_get_contents('../files/settings.json'));
$admin = json_decode(file_get_contents('../admin/files/settings.json'));
$dbFile = '../files/database.json';
$db = json_decode(file_get_contents($dbFile));
// Main
main();
// Functions
function main()
{
    global $result;
    if (!isset($_POST["key"])) {
        if (isset($_POST["id"])) {
            // User Actions
            $id = intval($_POST["id"], 10);
            if (isRegistered($id)) {
                if (isset($_POST["data"])) {
                    $data = json_decode($_POST["data"]);
                    if (isset($_POST["seed"])) {
                        $seed = intval($_POST["seed"]);
                        if (verifySeed($id, $seed)) {
                            $result->meeting = createMeeting($id, $data);
                        } else {
                            $result->meeting->created = false;
                        }
                    } else {
                        $result->error = "No Seed";
                    }
                } else {
                    $result->user = loadUser($id);
                }
            } else {
                if (isset($_POST["data"])) {
                    $data = json_decode($_POST["data"]);
                    $result->user = createUser($data);
                }
            }
        } else if (isset($_POST["date"])) {
            $date = json_decode($_POST["date"]);
            $result->times = loadTimes($date);
        } else {
            $result->error = "Unknown Action";
        }
    } else {
        // Admin mode
        $key = $_POST["key"];
        $auth = checkKey($key);
        $result->auth = $auth;
        if ($auth) {
            if (isset($_POST["action"])) {
                $action = $_POST["action"];
                if ($action === "get") {
                    if (isset($_POST["get"])) {
                        $get = $_POST["get"];
                        $result->results = array();
                        if ($get === "pending" || $get === "approved" || $get === "denied") {
                            $result->results = byState($get);
                        } else if ($get === "date") {
                            if (isset($_POST["date"])) {
                                $date = json_decode($_POST["date"]);
                                $result->results = byDate($date);
                            }
                        } else if ($get === "dates") {
                            $result->results = loadOccupiedDates();
                        }
                    }
                } else if ($action === "set") {
                    if (isset($_POST["set"])) {
                        $set = $_POST["set"];
                        if ($set === "state") {
                            if (isset($_POST["state"])) {
                                $state = $_POST["state"];
                                if (isset($_POST["id"])) {
                                    $id = intval($_POST["id"]);
                                    $result->result = changeMeetingState($id, $state);
                                }
                            }
                        } else if ($set === "close") {
                            if (isset($_POST["close"])) {
                                $date = json_decode($_POST["close"]);
                                $result->closed = closeDate($date);
                            }
                        }
                    }
                } else {
                    $result->error = "Unknown Action";
                }
            }
        }
    }
    echo json_encode($result);
}

function createMeeting($id, $data)
{
    global $db, $settings;
    $result = new stdClass();
    $date = $data->time->date;
    $time = $data->time->time;
    $occupied = isOccupied($time, byDate($date, null));
    $inbounds = $time >= $settings->start && $time <= $settings->end && ($time - $settings->start) % $settings->interval === 0;
    $create = !$occupied && $inbounds;
    if ($create) {
        $meetingId = generateMeetingId();
        $meeting = new stdClass();
        $meetingContent = new stdClass();
        $meetingTime = new stdClass();
        $meetingTimeDate = new stdClass();
        $meetingTimeDate->day = $date->day;
        $meetingTimeDate->month = $date->month;
        $meetingTimeDate->year = $date->year;
        $meetingTime->time = $time;
        $meetingTime->date = $meetingTimeDate;
        $meetingContent->reason = $data->content->reason;
        $meeting->time = $meetingTime;
        $meeting->state = "pending";
        $meeting->content = $meetingContent;
        $meeting->id = $meetingId;
        $meeting->user = $id;
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
        $result->id = $meetingId;
    }
    $result->created = $create;
    return $result;
}

function verifySeed($id, $seed)
{
    global $db;
    $users = $db->users;
    for ($u = 0; $u < sizeof($users); $u++) {
        if ($users[$u]->id === $id) {
            return $users[$u]->seed === $seed;
        }
    }
    return false;
}

function isOccupied($time, $occupied)
{
    for ($m = 0; $m < sizeof($occupied); $m++) {
        if ($occupied[$m]->time->time === $time && $occupied[$m]->state !== "denied") return true;
    }
    return false;
}

function loadTimes($date)
{
    global $settings;
    $result = new stdClass();
    $occupied = byDate($date, null);
    $empty = array();
    for ($s = $settings->start; $s < $settings->end; $s += $settings->interval) {
        if (!isOccupied($s, $occupied)) {
            array_push($empty, $s);
        }
    }
    $result->times = $empty;
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
            $user->type = $currentUser->type;
            $user->status = $currentUser->status;
            // Only Load Indexes
            // $user->meetings = $currentUser->meetings;
            // Load Full Meetings
            $meetings = array();
            for ($m = 0; $m < sizeof($currentUser->meetings); $m++) {
                array_push($meetings, byId($currentUser->meetings[$m]));
            }
            $user->meetings = $meetings;
        }
    }
    return $user;
}

function createUser($data)
{
    global $db;
    $result = new stdClass();
    if (isset($data->name) && isset($data->phone)) {
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
    }
    return $result;
}

function byId($id)
{
    global $db;
    $meetings = $db->meetings;
    $meeting = null;
    for ($i = 0; $i < sizeof($meetings) && $meeting === null; $i++) {
        if ($meetings[$i]->id === $id) $meeting = $meetings[$i];
    }
    return $meeting;
}

function isRegistered($id)
{
    global $db;
    $users = $db->users;
    for ($i = 0; $i < sizeof($users); $i++) {
        if ($users[$i]->id === $id) return true;
    }
    return false;

}

function generateMeetingId()
{
    global $db;
    $meetings = $db->meetings;
    $id = null;
    while ($id === null) {
        $random = rand(1, 100000);
        $found = false;
        for ($i = 0; $i < sizeof($meetings) && $found = false; $i++) {
            if ($meetings[$i]->id === $id) $found = true;
        }
        if (!$found) $id = $random;
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
        $found = false;
        for ($i = 0; $i < sizeof($users) && $found = false; $i++) {
            if ($users[$i]->id === $id) $found = true;
        }
        if (!$found) $id = $random;
    }
    return $id;
}

function byState($state)
{
    global $db;
    $result = array();
    $meetings = $db->meetings;
    for ($m = 0; $m < sizeof($meetings); $m++) {
        if ($meetings[$m]->state === $state) array_push($result, $meetings[$m]);
    }
    return $result;
}

function byDate($date, $state = "approved")
{
    global $db;
    $result = array();
    $meetings = $db->meetings;
    for ($m = 0; $m < sizeof($meetings); $m++) {
        $checkAgainst = $meetings[$m]->time->date;
        if ($checkAgainst->day === $date->day &&
            $checkAgainst->month === $date->month &&
            $checkAgainst->year === $date->year) {
            if ($state !== null) {
                if ($meetings[$m]->state === $state) {
                    array_push($result, $meetings[$m]);
                }
            } else {
                array_push($result, $meetings[$m]);
            }
        }
    }
    return $result;
}

function closeDate($date)
{
    global $settings;
    $start = $settings->start;
    $end = $settings->end;
    $interval = $settings->interval;
    $occupied = byDate($date, null);
    for ($m = $start; $m < $end; $m += $interval) {
        if (!isOccupied($m, $occupied)) {
            $data = new stdClass();
            $dataContent = new stdClass();
            $dataContent->reason = "Day Closed";
            $data->content = $dataContent;
            $dataTime = new stdClass();
            $dataTime->time = $m;
            $dataTime->date = $date;
            $data->time = $dataTime;
            $result = createMeeting(0, $data);
            if (isset($result->id)) {
                changeMeetingState($result->id, "approved");
            }
        }
    }
    return true;
}

function loadOccupiedDates()
{
    global $db;
    $result = array();
    $meetings = $db->meetings;
    for ($m = 0; $m < sizeof($meetings); $m++) {
        $checkAgainst = $meetings[$m]->time->date;
        $alreadyInserted = false;
        for ($i = 0; $i < sizeof($result) && !$alreadyInserted; $i++) {
            if ($checkAgainst->day === $result[$i]->day &&
                $checkAgainst->month === $result[$i]->month &&
                $checkAgainst->year === $result[$i]->year) {
                $alreadyInserted = true;
            }
        }
        if (!$alreadyInserted) {
            array_push($result, $checkAgainst);
        }
    }
    return $result;
}

function changeMeetingState($id, $state)
{
    global $db;
    $result = new stdClass();
    $result->changed = false;
    $meetings = $db->meetings;
    for ($m = 0; $m < sizeof($meetings); $m++) {
        if ($meetings[$m]->id === $id) {
            $meetings[$m]->state = $state;
            $result->changed = true;
        }
    }
    $db->meetings = $meetings;
    save();
    return $result;
}

function checkKey($key)
{
    global $admin;
    return $key === $admin->password;
}

function save()
{
    global $db, $dbFile;
    file_put_contents($dbFile, json_encode($db));
}