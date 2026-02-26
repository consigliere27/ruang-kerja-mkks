document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('info-modal');
    const closeBtn = document.querySelector('.close-btn');

    // Modal Elements (View Mode)
    const modalTitle = document.getElementById('modal-title');
    const modalPj = document.getElementById('modal-pj');
    const modalSpek = document.getElementById('modal-spek');
    const modalStatus = document.getElementById('modal-status');
    const viewModes = document.querySelectorAll('.view-mode');

    // Modal Elements (Edit Mode)
    const editPj = document.getElementById('edit-pj');
    const editSpek = document.getElementById('edit-spek');
    const editStatus = document.getElementById('edit-status');
    const editInputs = document.querySelectorAll('.edit-input');

    // Buttons
    const btnEdit = document.getElementById('btn-edit');
    const btnCancel = document.getElementById('btn-cancel');
    const btnSave = document.getElementById('btn-save');
    const saveActions = document.getElementById('save-actions');

    let currentItem = null; // Store reference to the currently clicked item

    // --- 1. Load data from localStorage on init ---
    const allClickables = document.querySelectorAll('.clickable');
    allClickables.forEach(item => {
        const id = item.dataset.id;
        if (id) {
            const savedData = localStorage.getItem('mkks_item_' + id);
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    if (parsed.pj) item.dataset.pj = parsed.pj;
                    if (parsed.spek) item.dataset.spek = parsed.spek;
                    if (parsed.status) item.dataset.status = parsed.status;
                } catch (e) {
                    console.error('Error parsing localStorage for', id);
                }
            }
        }
    });

    // --- 2. Open Modal Logic ---
    document.addEventListener('click', (e) => {
        // Prevent click events if we are clicking inside the modal itself
        if (e.target.closest('.modal-content')) return;

        const clickable = e.target.closest('.clickable');
        if (!clickable) return;

        // Prevent room-block click from also triggering inner item click
        // Inner items have their own data, so they should take priority
        const innerClickable = e.target.closest('.room-inner .clickable');
        const roomBlock = e.target.closest('.room-block.clickable');

        let target = clickable;
        if (innerClickable) {
            target = innerClickable;
        } else if (roomBlock) {
            target = roomBlock;
        }

        const label = target.dataset.label;
        if (!label) return;

        currentItem = target; // Save the reference
        
        const pj = target.dataset.pj || '-';
        const spek = target.dataset.spek || '-';
        const status = target.dataset.status || '-';

        // Populate view mode
        modalTitle.textContent = label;
        modalPj.textContent = pj;
        modalSpek.textContent = spek;
        modalStatus.textContent = status;

        // Apply status styling (View mode only)
        modalStatus.className = 'value status-badge view-mode';
        if (status === 'Baik') {
            modalStatus.classList.add('status-baik');
        } else if (status === 'Perbaikan' || status === 'Rusak' || status === 'Restricted') {
            modalStatus.classList.add('status-perbaikan');
        } else {
            modalStatus.classList.add('status-na');
        }

        // Reset to view mode
        setMode('view');

        // Show modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });

    // --- 3. Mode Toggling ---
    function setMode(mode) {
        if (mode === 'edit') {
            // Hide view elements
            viewModes.forEach(el => el.classList.add('hidden'));
            btnEdit.classList.add('hidden');
            
            // Show edit elements
            editInputs.forEach(el => el.classList.remove('hidden'));
            saveActions.classList.remove('hidden');

            // Populate form with current values
            editPj.value = currentItem.dataset.pj !== '-' ? currentItem.dataset.pj : '';
            editSpek.value = currentItem.dataset.spek !== '-' ? currentItem.dataset.spek : '';
            
            // Handle status select
            const currentStatus = currentItem.dataset.status;
            let optionFound = false;
            Array.from(editStatus.options).forEach(opt => {
                if (opt.value === currentStatus) optionFound = true;
            });
            editStatus.value = optionFound ? currentStatus : 'N/A';
            
        } else {
            // Hide edit elements
            editInputs.forEach(el => el.classList.add('hidden'));
            saveActions.classList.add('hidden');
            
            // Show view elements
            viewModes.forEach(el => el.classList.remove('hidden'));
            btnEdit.classList.remove('hidden');
        }
    }

    // --- 4. Event Listeners for Buttons ---
    btnEdit.addEventListener('click', () => setMode('edit'));
    btnCancel.addEventListener('click', () => setMode('view'));

    btnSave.addEventListener('click', () => {
        if (!currentItem) return;

        // 1. Get new values
        const newPj = editPj.value.trim() || '-';
        const newSpek = editSpek.value.trim() || '-';
        const newStatus = editStatus.value;
        const id = currentItem.dataset.id;

        // 2. Update HTML dataset
        currentItem.dataset.pj = newPj;
        currentItem.dataset.spek = newSpek;
        currentItem.dataset.status = newStatus;

        // 3. Update Visuals in View Mode
        modalPj.textContent = newPj;
        modalSpek.textContent = newSpek;
        modalStatus.textContent = newStatus;

        modalStatus.className = 'value status-badge view-mode';
        if (newStatus === 'Baik') {
            modalStatus.classList.add('status-baik');
        } else if (newStatus === 'Perbaikan' || newStatus === 'Rusak' || newStatus === 'Restricted') {
            modalStatus.classList.add('status-perbaikan');
        } else {
            modalStatus.classList.add('status-na');
        }

        // 4. Save to localStorage
        if (id) {
            const dataToSave = {
                pj: newPj,
                spek: newSpek,
                status: newStatus
            };
            localStorage.setItem('mkks_item_' + id, JSON.stringify(dataToSave));
        }

        // 5. Back to view mode
        setMode('view');
    });

    // --- 5. Close Modal ---
    const closeModal = () => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        setMode('view'); // reset mode on close
    };

    closeBtn.addEventListener('click', closeModal);

    // Click outside modal content
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });
});
