### Changelog
All notable changes to this project will be documented in this file.

## [1.4.0] - 2019-02-26
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
