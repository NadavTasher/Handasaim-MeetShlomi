<?php
$result = new stdClass();
$settings = json_decode(file_get_contents('../files/settings.json'));
$schedulebaseFile = '../files/schedulebase.json';
$schedulebase = json_decode(file_get_contents($schedulebaseFile));
if (isset($_POST["date"])) {
    $date = json_decode($_POST["date"]);
    if (isset($_POST["meeting"])) {

    } else {
        $result->slots = loadBase($date);
    }
}
function loadBase($date)
{
    global $schedulebase, $settings;
    $base = new stdClass();
    $base->slot = $settings->slot;
    // Scan ScheduleBase For Same Date
    $occupiedSlots = array();
    $meetingIndex = $schedulebase->index;
    for ($i = 0; $i < sizeof($meetingIndex); $i++) {
        $indexName = $meetingIndex[$i];
        $currentMeeting = $schedulebase->meetings->$indexName;
        $currentDate = $currentMeeting->slot->date;
        if ($currentDate->day === $date->day && $currentDate->month === $date->month && $currentDate->year === $date->year) {
            array_push($occupiedSlots, $currentMeeting->slot->slot);
        }
    }
    $slots = array();
    for ($s = $settings->start; $s < $settings->end; $s++) {
        $occupied = false;
        for ($os = 0; $os < sizeof($occupiedSlots); $os++) {
            if ($occupiedSlots[$os] === $s) {
                $occupied = true;
            }
        }
        if (!$occupied) {
            array_push($slots, $s);
        }
    }
    $base->slots = $slots;
    return $base;
}