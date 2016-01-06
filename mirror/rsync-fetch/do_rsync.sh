#!/bin/sh

# New and improved with FLOCK
# Sehr Gut !
# Funf Sterne !


# Usage: name host ['common opts'] ['1st run opts'] ['2nd run opts'] ...

if test "$#" -lt 2; then
	echo "too little arguments!"
	exit 1
fi

RSYNC=rsync
NAME="$1"; shift
HOST="rsync://$1"; shift

if test "$#" -eq 1; then
	# no stage 1, only common
	set -- "$1" ''
elif test "$#" -eq 0; then
	# no common
	set -- '' ''
fi

COMMON_OPTS="$1"; shift

BASEDIR=/var/www/download
CONTENTLOG=$BASEDIR/log/content/$NAME
MAINLOG=$BASEDIR/log/mirror.log

_log() {
	level="$1"; shift
	printf >>$MAINLOG "`date +'%Y/%m/%d %T'` $NAME [$level] $1\n"
}

log_info() { _log 'info' "$*"; }
log_error() { _log 'error' "$*"; }

LOCKFILE=$BASEDIR/log/lock/$NAME.lock
exec 9>"$LOCKFILE"

failyo() {
	log_error 'sync in progress? stopping'
	exit 1
}

flock -n 9 || failyo

die() {
	/bin/rm $LOCKFILE
	log_info 'sync done'
}
trap 'die' EXIT

PROGRESSFILE=$BASEDIR/log/progress/$NAME
DATADIR=$BASEDIR/data/$NAME/

log_info "sync started"
stage=1
stage_total=$#
log_stage_info() { log_info "[$stage/$stage_total] $*"; }
log_stage_error() { log_error "[$stage/$stage_total] $*"; }

rsync_with_retry(){
	TRIES=0
	LIMIT=2
	while [ $TRIES -lt $LIMIT ]
	do
		let TRIES=TRIES+1
		eval < /dev/null >>$MAINLOG 2>&1 $1
		if [ "$?" = "0" ] ; then
			echo "rsync completed normally"
			break
		else
			echo "Rsync failure. Backing off and retrying..."
			if [ $TRIES -ne $LIMIT ] ; then
				sleep 15
			fi
 		fi
	done
}

while test "$#" -ne 0; do
	opts="$1"; shift
	args="$COMMON_OPTS $opts --log-file=$CONTENTLOG $HOST $DATADIR --progress -v >$PROGRESSFILE"

	log_stage_info "started"
	rsync_with_retry "$RSYNC $args"
	#eval < /dev/null >>$MAINLOG 2>&1 "$RSYNC $args"
	code="$?"
	if [ "$code" = 0 ]; then
		log_stage_info "done"
	else
		log_stage_error "failed with '$code'; args were '$args'"
		exit 1
	fi
	stage=$(($stage + 1))
done