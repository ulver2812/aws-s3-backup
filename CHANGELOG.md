### Changelog
All notable changes to this project will be documented in this file.

## [1.6.0] - 2019-03-20
### Fixed
- Error popup when trying to run more then one app instance
- Fixed typos in menu and pages
### Added
- S3 Buckets Statistics
- Support for standard storage IA in S3 explorer and statistics

## [1.5.0] - 2019-03-12
### Fixed
- The backup 'is running' spinner remain stuck when the AWS CLI S3 generates an error
- The backup don't continue if the previous file/folder generate an error with an exit code 2 of the AWS CLI
### Added
- Auto start on OS boot
- App single instance check to avoid multiple app instances
- Time (minutes to hours ) and data (KB/s to Mb/s) unit conversion in settings and add/edit job pages
- --no-follow-symlinks option to aws s3 sync command
- Italian translation for the next run date in the job list
### Changed
- Email errors notification, now you will receive error log only when the job is done

## [1.4.1] - 2019-03-07
### Fixed
- Email notification: logs attachment was missing on backup error

## [1.4.0] - 2019-03-06
### Fixed
- With multiple folders in the backup job the S3 paths were wrong
### Changed
- Now processes run in sequential order for better performance
### Added
- Stop backup button in job list view
- Now the AWS CLI processes are killed on app exit
- Now the current backup running process are killed after its done
- Bucket info: size and number of objects are shown in S3 explorer view through AWS Cloudwatch
- More app's icons for better rendering on Win 10 OS
- Now you can limit S3 upload speed by adjust bandwidth and concurrent requests, 
to avoid excessive band consumption
- Now you can set the backup max duration time, in order to stop the backup after a certain 
amount of time regardless the real time needed to complete the backup.

## [1.3.0] - 2019-02-26
### Added
- Auto updater

## [1.2.0] - 2019-02-25
### Added
- Email notifications

## [1.1.0] - 2019-01-17
### Changed
- UI Enhancements

## [1.0.0] - 2018-10-27
### Added
- First release
