var gulp = require('gulp'),
	del = require('del'),
	plumber = require('gulp-plumber'),
	plum = 	require('plumber'),
	sass = require('gulp-sass');


var defaultTasks = [
	'html',
	'style',
	'sass',
	'images',
	'fonts',
	'script'
]

gulp.task('html', function(){
	return gulp.src('./dev/**/*.html')
		.pipe(gulp.dest('public/'))
})

gulp.task('style', function(){
	return gulp.src('./dev/assets/style/*.css')
		.pipe(gulp.dest('public/assets/style/'))
})

gulp.task('images', function(){
	return gulp.src('./dev/assets/images/**/*.*')
		.pipe(gulp.dest('public/assets/images/'))
})

gulp.task('fonts', function(){
	return gulp.src('./dev/assets/fonts/**/*.*')
		.pipe(gulp.dest('public/assets/fonts/'))
})

gulp.task('sass', function(){
	return gulp.src('./dev/assets/style/*.scss')
		.pipe(plumber())
		.pipe(sass({outputStyle: 'compressed'}))
		.pipe(sass.sync().on('Error', sass.logError))
		.pipe(gulp.dest('public/assets/./style'))
})

gulp.task('script', function(){
	return gulp.src('./dev/script/**/*.js')
		.pipe(gulp.dest('public/script/'))
})

gulp.task('clean', function(cb){
	del(defaultTasks, cb)
})

gulp.task('watch', function(){
	gulp.watch('./dev/**/*.html', ['html'])
	gulp.watch('./dev/assets/fonts/**/*.*', ['fonts'])
	gulp.watch('./dev/assets/images/**/*.*', ['images'])
	gulp.watch('./dev/assets/style/*.scss', ['sass'])
	gulp.watch('./dev/assets/style/*.css',['style'])
	gulp.watch('./dev/script/**/*.js', ['script'])
})

gulp.task('default', ['clean'])
gulp.task('drivestays', defaultTasks)
gulp.start()