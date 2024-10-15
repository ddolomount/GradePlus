function main() {
    var topinfo = $("h2.top-info-header").text();
    var isCourseOpen = false;
    //Switch to Account Settings
    $("a.accountservice").click(()=>{
        $("div.course-list").fadeOut(200);
        $("div.account-settings").fadeIn(200);
        $("h2.top-info-header").text("Account Settings");
        if (isCourseOpen){
            $("a.backuserdashboard").click();
        };
    })

    //Switch to Course List
    $("a.account-settings-back").click(()=>{
        $("div.course-list").fadeIn(200);
        $("div.account-settings").fadeOut(200);
        $("h2.top-info-header").text(topinfo);
    })

    //Add or Enroll Course Modal
    $("a.addenrolcourse").click(()=>{
        if ($("a.addenrolcourse").attr("id")==="enroltrue"){
            $("div.modal-content h4").text("Enter Invite Code");
            $("div.course-name").hide();
            $("div.upload-banner").hide();
            $("a.addenrol-modal-add").hide();
        } else {
            $("div.modal-content h4").text("Add Course");
            $("a.addenrol-modal-enrol").hide();
        }
        $("div.modal").fadeIn(100);
    })

    $("a.addenrol-modal-enrol").click(() => {
        if (!$("input[name='coursecode']").val()) {
            $("p.status-text").text("Field cannot be left blank");
            $("p.status-text").slideDown();
            setTimeout(() => {
                $("p.status-text").slideUp();
            }, 3000);
            return;
        }

        $.ajax({
            url: "services/enroll-course.php",
            type: "POST",
            data: {username: $("span.user-name").text(), invite_code: $("input[name='coursecode']").val(), authorize: "gradeplus"},
            dataType : "json",
            success: (response) => {
                if (response["invalid"] == 1) {
                    $("p.status-text").text("Invalid Invalid Code");
                    $("p.status-text").slideDown();
                    setTimeout(() => {
                        $("p.status-text").slideUp();
                    }, 3000);
                    return;
                } else if (response["error"] == 1) {
                    $("p.status-text").text("500 - Server Error");
                    $("p.status-text").slideDown();
                    setTimeout(() => {
                        $("p.status-text").slideUp();
                    }, 3000);
                    return;
                } else if (response["exists"] == 1) {
                    $("p.status-text").text("Already Enrolled in Course");
                    $("p.status-text").slideDown();
                    setTimeout(() => {
                        $("p.status-text").slideUp();
                    }, 3000);
                    return;
                } else {
                    window.location.reload();
                }
            }
        });
    })

    $("a.addenrol-modal-add").click(() => {
        let formData = new FormData();
        let courseCode = $("input[name='coursecode']").val();
        let courseName = $("input[name='coursename']").val();
        let bannerFile = $("input[name='coursebanner']")[0].files[0];

        if (!courseCode || !courseName) {
            $("p.status-text").text("Fields cannot be left blank");
            $("p.status-text").slideDown();
            setTimeout(() => {
                $("p.status-text").slideUp();
            }, 3000);
            return;
        }

        formData.append("coursecode", courseCode);
        formData.append("coursename", courseName);
        formData.append("banner", bannerFile);
        formData.append("instructor_name", $("span.user-name").text());
        formData.append("instructor_dname", $("span.display-name").text());
        formData.append("authorize", "gradeplus");

        $.ajax({
            url: "services/add-course.php",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            dataType : "json",
            success: (response) => {
                if (response["success"] != 1) {
                    $("p.status-text").text("500 - Server Error");
                    $("p.status-text").slideDown();
                    setTimeout(() => {
                        $("p.status-text").slideUp();
                    }, 3000);
                    return;
                } else {
                    window.location.reload();
                }
            }
        });
    })

    $("a.addenrol-modal-cancel").click(() => {
        $("div.modal").fadeOut(100);
        $("div.input-field input").val("");
    })

    //Closing a Course
    $("a.backuserdashboard").click(()=>{
        isCourseOpen = false;
        $("ul.side-nav").animate({left: '-20rem'}, {
            duration: 100,
            easing: 'swing'
        });
        $("div.coursedash").fadeOut(200,()=>{
            $("div.courseholder").fadeIn(200);
        });
    })
    
    function loadContent(url, headerText) {
        $("h3.coursedash-header").text(headerText);
        $("div.coursedash-content").fadeOut(200, function () {
            $.ajax({
                url: url,
                method: 'GET',
                success: function (data) {
                    $("div.coursedash-content").html(data).fadeIn(200);
                },
                error: function (xhr, status, error) {
                    console.error("Failed to load content:", status, error);
                }
            });
        });
    }

    // Assignments
    $("a.assignments").click(() => {
        loadContent('assignments.php', 'Assignments');
    });

    // Grades
    $("a.grades").click(() => {
        loadContent('grades.php', 'Grades');
    });

    // Peer Reviews
    $("a.peer-reviews").click(() => {
        loadContent('peer_reviews.php', 'Peer Reviews');
    });

    // Discussions
    $("a.discussions").click(() => {
        loadContent('discussions.php', 'Discussions');
    });

    // Classlist
    $("a.classlist").click(() => {
        loadContent('classlist.php', 'Classlist');
    });

    // Settings
    $("a.csettings").click(() => {
        loadContent('course_settings.php', 'Course Settings');
    });

    $("#file-picker-btn").click(()=>{
        $("input[name='coursebanner']").click();
    });
    $('#coursecode').on('input', function() {
        $(this).val($(this).val().toUpperCase());
    });

    function retrieve_courses() {
    //Retrieving Courses
    $.ajax({
        url: "services/retrieve-course.php",
        type: "POST",
        data: {
            "username": $("span.user-name").text(),
            "authorize": "gradeplus"
        },
        dataType : "json",
        success: (response) => {
            if (response["success"] != 1) {
                return;
            } else {
                let courses = response["courses"];
                let courseHolder = $("div.course-list-holder");
                courseHolder.empty();
                courses.forEach((course) => {
                    let pinnedlogo = "keep_off";
                    if (course["pinned"] == 1) {
                        pinnedlogo = "keep";
                    }
                    let courseCard = `
                    <div class="card course-card std-hover bwcolor" style="background-color: var(--bwcolor); position: relative;">
                        <div class="card-image" style="height: 12rem; overflow: hidden;">
                            <img style="object-fit: cover;" src="${course["course_banner"]}" alt="Unable to Load Image">
                            <span class="card-title"><span class="card-title-code">${course["course_code"]}</span>
                        </div>
                        <div class="card-content">
                            <p>${course["course_name"]}</p>
                            <p class='secondary'>${course["instructor_name"]}</p>
                        </div>
                         <a id="${course["invite_code"]}" style="position: absolute; top: 1rem; right: 1rem;" class='pin btn-floating halfway-fab waves-effect waves-light green addenrolcourse'><i
                                class='material-symbols-outlined'>${pinnedlogo}</i></a></span>
                    </div>`;
                    courseHolder.append(courseCard);
                });

                if (courses.length == 0) {
                    courseHolder.append(
                        `<div class="card std-hover bwcolor" style="background-color: var(--bwcolor); position: relative;">
                            <div class="card-image" style="height: 12rem; overflow: hidden;">
                            <img class="addcourseimg" style="object-fit: cover;" src="img/addcourse.png" alt="Unable to Load Image">
                        </div>
                            <div class="card-content">
                                <p>No Courses Found</p>
                            </div>
                        </div>`
                    );
                }

                //Opening a Course
                $("div.course-card").click((event) => {
                    isCourseOpen = true;
                    $("img.side-nav-img").attr("src", $(event.currentTarget).find("img").attr("src"));
                    $("ul.side-nav").animate({left: '0'}, {
                        duration: 100,
                        easing: 'swing'
                    });
                    var coursecode = $(event.currentTarget).find("span.card-title-code").text();
                    var invitecode = $(event.currentTarget).find("a.addenrolcourse").attr("id");
                    $("p.side-nav-course-invite").text(invitecode);
                    $("p.side-nav-course-code").text(coursecode);
                    $("div.courseholder").fadeOut(200,()=>{
                        $("div.coursedash").fadeIn(200).css("display", "flex");
                        $("h3.coursedash-header").text("Assignments");
                    });
                });

                //Pinning a Course
                $("a.pin").click((event)=>{
                    event.stopPropagation();
                    let invite_code = $(event.currentTarget).attr("id");
                    isPinned = $(event.currentTarget).find("i").text() == "keep_off" ? true : false;
                    $.ajax({
                        url: "services/pin-course.php",
                        type: "POST",
                        data: {
                            "username": $("span.user-name").text(),
                            "invitecode": invite_code,
                            "pinned": isPinned ? 1 : 0,
                            "authorize": "gradeplus"
                        },
                        dataType : "json",
                        success: (response) => {
                            if (response["success"] != 1) {
                                return;
                            } else {
                                $("div.course-list-holder").empty();
                                retrieve_courses();
                            }
                        }
                    });
                })
            }
        }});
    }
    retrieve_courses();
}

//Finish Loading
$(window).on("load", () => {   
    $("div.loader").fadeOut(200);
    setTimeout(() => {
        $("div.mainapp").fadeIn(200);
    }, 200);
    main();
});