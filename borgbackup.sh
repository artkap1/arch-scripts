# --exclude: 
function borgbackup() {
	sudo borg create /run/media/artkap/T7/laptop-arch::$1 / --exclude '/dev/*' --exclude '/proc/*' --exclude '/sys/*' --exclude '/tmp/*' --exclude '/run/*' --exclude '/mnt/*' --exclude '/media/*' --exclude '/lost+found/*' --exclude '/home/artkap/.local/share/Steam/*' --progress --stats;
	sudo borg prune --list --keep-last=3 --keep-daily=7 --keep-weekly=4 /run/media/artkap/T7/laptop-arch;
	sudo borg compact /run/media/artkap/T7/laptop-arch
}

function borgextract() {
	sudo borg extract /run/media/artkap/T7/laptop-arch::$1 --progress
}

function borgdelete() {
	sudo borg delete /run/media/artkap/T7/laptop-arch::$1
}

function borgcompact() {
	sudo borg compact /run/media/artkap/T7/laptop-arch
}

function borglist() {
	sudo borg list /run/media/artkap/T7/laptop-arch
}

function borgprune() {
	sudo borg prune --list --keep-daily=7 --keep-weekly=4 /run/media/artkap/T7/laptop-arch
}