let activities = JSON.parse(localStorage.getItem("activities")) || {};
let currentDate = new Date();
let selectedDate = null;
let calendarMode = "add";
let filterDate = null;

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function renderCalendar() {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    document.getElementById("monthYear").textContent =
        currentDate.toLocaleString("id-ID", { month: "long", year: "numeric" });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        calendar.innerHTML += `<div></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(year, month, day);
        const dateStr = formatDate(dateObj);

        let classes = "day border";
        if (dateStr === selectedDate) classes += " active-day";
        if (activities[dateStr]) classes += " has-event";

        calendar.innerHTML += `
            <div class="${classes}" onclick="selectDate('${dateStr}')">
                ${day}
            </div>
        `;
    }
}

function openCalendar(mode) {
    calendarMode = mode; 
    document.getElementById("calendarModal").classList.remove("hidden");
    renderCalendar();
}

function closeCalendarModal() {
    document.getElementById("calendarModal").classList.add("hidden");
}

function openDatePicker() {
    Swal.fire({
        title: 'Pilih Tanggal Kegiatan',
        input: 'date',
        inputAttributes: {
            required: true
        },
        showCancelButton: true,
        confirmButtonText: 'Pilih',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#2563eb'
    }).then((result) => {
        if (result.isConfirmed && result.value) {
            selectedDate = result.value;

            const btn = document.getElementById("dateButton");
            btn.textContent = selectedDate;
            btn.classList.remove("text-gray-500");
            btn.classList.add("text-black");
        }
    });
}

function selectDate(date) {

    if (calendarMode === "add") {
        // === PILIH TANGGAL KEGIATAN ===
        selectedDate = date;

        const btn = document.getElementById("dateButton");
        btn.textContent = formatTanggalIndonesia(date);
        btn.classList.remove("text-gray-500");
        btn.classList.add("text-black");

    } else if (calendarMode === "filter") {
        // === FILTER TANGGAL ===
        filterDate = date;

        const btn = document.getElementById("filterDateButton");
        btn.textContent = formatTanggalIndonesia(date);
        btn.classList.remove("text-gray-500");
        btn.classList.add("text-black");

        renderTable();
    }

    closeCalendarModal();
}

function changeMonth(offset) {
    currentDate.setMonth(currentDate.getMonth() + offset);
    renderCalendar();
}

function formatTanggalIndonesia(dateString) {
    const [year, month, day] = dateString.split("-");

    const date = new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
    );

    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function addActivity() {
    const name = document.getElementById("activityInput").value.trim();

    if (!name && !selectedDate) {
        Swal.fire('Oops!', 'Nama kegiatan dan tanggal wajib diisi', 'warning');
        return;
    }

    if (!name) {
        Swal.fire('Oops!', 'Nama kegiatan tidak boleh kosong', 'error');
        return;
    }

    if (!selectedDate) {
        Swal.fire('Oops!', 'Silakan pilih tanggal kegiatan', 'info');
        return;
    }

    // simpan tetap format YYYY-MM-DD
    if (!activities[selectedDate]) activities[selectedDate] = [];

    activities[selectedDate].push({
        id: Date.now(),
        name
    });

    localStorage.setItem("activities", JSON.stringify(activities));

    // RESET INPUT
    document.getElementById("activityInput").value = "";
    selectedDate = null;

    const btn = document.getElementById("dateButton");
    btn.textContent = "Pilih tanggal";
    btn.classList.add("text-gray-500");
    btn.classList.remove("text-black");

    Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Kegiatan berhasil disimpan',
        timer: 1200,
        showConfirmButton: false
    });

    renderTable();
    renderCalendar();
}

function deleteActivity(id) {
    Swal.fire({
        title: 'Hapus kegiatan?',
        text: 'Kegiatan ini akan dihapus permanen',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Ya, hapus'
    }).then((result) => {
        if (result.isConfirmed) {
            activities[selectedDate] =
                activities[selectedDate].filter(a => a.id !== id);

            if (activities[selectedDate].length === 0) {
                delete activities[selectedDate];
            }

            localStorage.setItem("activities", JSON.stringify(activities));

            Swal.fire({
                icon: 'success',
                title: 'Terhapus!',
                timer: 1000,
                showConfirmButton: false
            });

            renderCalendar();
            renderActivities();
        }
    });
}

function renderActivities() {
    const list = document.getElementById("activityList");
    list.innerHTML = "";

    if (!selectedDate || !activities[selectedDate]) {
        list.innerHTML = "<p class='text-gray-400'>Belum ada kegiatan</p>";
        return;
    }

    activities[selectedDate].forEach(act => {
    table.innerHTML += `
        <tr>
            <td>${formatTanggalIndonesia(date)}</td>
            <td>${act.name}</td>
            <td class="text-center">
                <button
                    onclick="deleteFromTable('${date}', ${act.id})"
                    class="btn btn-ghost btn-sm text-error"
                >
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
    `;
});

}

function renderTable() {
    const tbody = document.getElementById("activityTable");
    const keyword = document.getElementById("searchInput").value.toLowerCase();
    tbody.innerHTML = "";

    let found = false;

    Object.keys(activities).forEach(date => {

        // FILTER TANGGAL
        if (filterDate && date !== filterDate) return;

        activities[date].forEach(act => {
            if (act.name.toLowerCase().includes(keyword)) {
                found = true;
                tbody.innerHTML += `
                    <tr class="hover">
                        <td>${formatTanggalIndonesia(date)}</td>
                        <td>${act.name}</td>
                        <td class="text-center">
                            <button
                                onclick="deleteFromTable('${date}', ${act.id})"
                                class="btn btn-ghost btn-sm text-error"
                            >
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }
        });
    });

    if (!found) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-gray-400 py-6">
                    Kegiatan tidak ditemukan
                </td>
            </tr>
        `;
    }
}

function resetFilter() {
    filterDate = null;

    const btn = document.getElementById("filterDateButton");
    btn.textContent = "Pilih tanggal";
    btn.classList.add("text-gray-500");
    btn.classList.remove("text-black");

    document.getElementById("searchInput").value = "";
    renderTable();
}

function openFilterDate() {
    document.getElementById("filterDate").showPicker();
}

function setFilterDate(date) {
    const btn = document.getElementById("filterDateButton");

    filterDate = date || null; // ← SIMPAN FILTER

    if (!date) {
        btn.textContent = "Pilih tanggal";
        btn.classList.add("text-gray-500");
        btn.classList.remove("text-black");
    } else {
        btn.textContent = formatTanggalIndonesia(date);
        btn.classList.remove("text-gray-500");
        btn.classList.add("text-black");
    }

    renderTable();
}

function deleteFromTable(date, id) {
    Swal.fire({
        title: 'Hapus kegiatan?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Hapus',
        cancelButtonText: 'Batal'
    }).then(result => {
        if (!result.isConfirmed) return;

        activities[date] = activities[date].filter(a => a.id !== id);

        if (activities[date].length === 0) {
            delete activities[date];
        }

        localStorage.setItem("activities", JSON.stringify(activities));
        renderTable();
        renderCalendar();

        Swal.fire('Terhapus!', '', 'success');
    });
}

function deleteAllActivity(){
    if (Object.keys(activities).length === 0) {
        Swal.fire('Kosong', 'Tidak ada kegiatan untuk dihapus', 'info');
        return;
    }

    Swal.fire({
        title: 'Yakin hapus semua?',
        text: 'Semua kegiatan akan dihapus permanen',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, hapus',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#d33'
    }).then((result) => {
        if (result.isConfirmed) {
            activities = {};
            localStorage.removeItem("activities");

            document.getElementById("searchInput").value = "";
            document.getElementById("filterDate").value = "";

            renderTable();

            Swal.fire(
                'Berhasil',
                'Semua kegiatan telah dihapus',
                'success'
            );
        }
    });
}

renderTable();
renderCalendar();
