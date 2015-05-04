var gulp = require('gulp');
var stylus = require('gulp-stylus');

gulp.task('stylus', function() {
    gulp.src('public/styl/style.styl')
        .pipe(stylus())
        .pipe(gulp.dest('public/css'));
});

gulp.task('watch', function() {
    gulp.watch('public/styl/**/*.styl', ['stylus']);
});

gulp.task('default', ['stylus', 'watch']);