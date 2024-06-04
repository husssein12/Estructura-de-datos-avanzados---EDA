const memory = [
    { size: 256, free: true }
];
const actionHistory = [];

document.addEventListener('DOMContentLoaded', () => {
    renderMemory();
    updateFragmentation();
    renderActionHistory();
});

function renderMemory() {
    const memoryDiv = document.getElementById('memory');
    memoryDiv.innerHTML = '';
    memory.forEach(block => {
        const blockDiv = document.createElement('div');
        blockDiv.className = 'memory-block ' + (block.free ? 'free' : 'allocated');
        blockDiv.textContent = block.size + ' KB';
        memoryDiv.appendChild(blockDiv);
    });
    renderDebugInfo();
}

function splitBlock(block, size) {
    while (block.size > size) {
        const newSize = block.size / 2;
        memory.push({ size: newSize, free: true });
        memory.push({ size: newSize, free: true });
        block.size = newSize;
    }
    block.free = false;
}

function allocate(size) {
    const index = memory.findIndex(block => block.free && block.size >= size);
    if (index !== -1) {
        splitBlock(memory[index], size);
        actionHistory.push(`Asignado ${size} KB`);
        renderMemory();
        updateFragmentation();
        renderActionHistory();
    } else {
        alert('No hay suficiente memoria libre para asignar ' + size + ' KB');
    }
}

function allocateCustom() {
    const size = parseInt(document.getElementById('customSize').value);
    if (isNaN(size) || size <= 0) {
        alert('Ingrese un tamaño válido.');
        return;
    }
    allocate(size);
}

function freeBlock(size) {
    const index = memory.findIndex(block => !block.free && block.size === size);
    if (index !== -1) {
        memory[index].free = true;
        mergeBlocks();
        actionHistory.push(`Liberado ${size} KB`);
        renderMemory();
        updateFragmentation();
        renderActionHistory();
    } else {
        alert('No hay bloques asignados de ' + size + ' KB para liberar');
    }
}

function freeCustom() {
    const size = parseInt(document.getElementById('customSize').value);
    if (isNaN(size) || size <= 0) {
        alert('Ingrese un tamaño válido.');
        return;
    }
    freeBlock(size);
}

function mergeBlocks() {
    let i = 0;
    while (i < memory.length) {
        if (memory[i].free) {
            const buddyIndex = memory.findIndex((block, idx) => 
                idx !== i && block.free && block.size === memory[i].size
            );
            if (buddyIndex !== -1) {
                memory[i].size *= 2;
                memory.splice(buddyIndex, 1);
                i = 0; // Reiniciar para verificar posibles nuevas fusiones
            } else {
                i++;
            }
        } else {
            i++;
        }
    }
}

function updateFragmentation() {
    const totalSize = memory.reduce((acc, block) => acc + block.size, 0);
    const freeSize = memory.filter(block => block.free).reduce((acc, block) => acc + block.size, 0);
    const fragmentation = ((freeSize / totalSize) * 100).toFixed(2);
    document.getElementById('fragmentation').textContent = `Fragmentación: ${fragmentation}%`;
}

function renderActionHistory() {
    const actionHistoryDiv = document.getElementById('actionHistory');
    actionHistoryDiv.innerHTML = '<h2>Historial de Acciones</h2><ul>' + actionHistory.map(action => `<li>${action}</li>`).join('') + '</ul>';
}

function renderDebugInfo() {
    const debugInfoDiv = document.getElementById('debugInfo');
    debugInfoDiv.innerHTML = '<h2>Información de Depuración</h2><pre>' + JSON.stringify(memory, null, 2) + '</pre>';
}
