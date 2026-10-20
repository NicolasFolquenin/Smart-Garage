import { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import BackupDataService from '../services/backupDataService';
import { Card, Button, Table, Badge, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';

const GerenciarBackups = () => {
    const [backups, setBackups] = useState([]);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    // Modais de confirmação
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [selectedBackupToRestore, setSelectedBackupToRestore] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedBackupToDelete, setSelectedBackupToDelete] = useState(null);

    const [showDriveGuideModal, setShowDriveGuideModal] = useState(false);

    // Upload de arquivo
    const [uploadFile, setUploadFile] = useState(null);
    const [showUploadRestoreModal, setShowUploadRestoreModal] = useState(false);

    const carregarDados = useCallback(async () => {
        setLoading(true);
        try {
            const [statusRes, backupsRes] = await Promise.all([
                BackupDataService.getStatus(),
                BackupDataService.listar()
            ]);
            setStatus(statusRes.data);
            setBackups(backupsRes.data || []);
        } catch (error) {
            console.error('Erro ao carregar dados de backup:', error);
            toast.error('Erro ao carregar informações de backup.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    const handleCriarBackup = async () => {
        setActionLoading(true);
        setLoadingMessage('Gerando cópia de segurança do banco de dados e arquivos...');
        try {
            const res = await BackupDataService.criar();
            toast.success(res.data.mensagem || 'Backup gerado com sucesso!');
            await carregarDados();
        } catch (error) {
            console.error('Erro ao criar backup:', error);
            const msg = error.response?.data?.mensagem || 'Falha ao gerar backup.';
            toast.error(msg);
        } finally {
            setActionLoading(false);
            setLoadingMessage('');
        }
    };

    const handleDownload = async (filename) => {
        try {
            toast.info(`Iniciando download de ${filename}...`);
            await BackupDataService.download(filename);
        } catch (error) {
            console.error('Erro ao baixar backup:', error);
            toast.error('Falha ao baixar arquivo de backup.');
        }
    };

    const confirmarRestaurar = async () => {
        if (!selectedBackupToRestore) return;
        setShowRestoreModal(false);
        setActionLoading(true);
        setLoadingMessage(`Restaurando banco de dados e arquivos a partir de ${selectedBackupToRestore}...`);

        try {
            const res = await BackupDataService.restaurar(selectedBackupToRestore);
            toast.success(res.data.mensagem || 'Backup restaurado com sucesso! Recarregando sistema...');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error('Erro ao restaurar backup:', error);
            const msg = error.response?.data?.mensagem || 'Falha ao restaurar backup.';
            toast.error(msg);
            setActionLoading(false);
            setLoadingMessage('');
        }
    };

    const confirmarExclusao = async () => {
        if (!selectedBackupToDelete) return;
        setShowDeleteModal(false);
        setActionLoading(true);
        setLoadingMessage('Excluindo backup...');

        try {
            await BackupDataService.excluir(selectedBackupToDelete);
            toast.success('Backup excluído com sucesso.');
            await carregarDados();
        } catch (error) {
            console.error('Erro ao excluir backup:', error);
            toast.error('Falha ao excluir backup.');
        } finally {
            setActionLoading(false);
            setLoadingMessage('');
            setSelectedBackupToDelete(null);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.name.endsWith('.zip')) {
                toast.error('Selecione apenas arquivos .zip de backup.');
                e.target.value = null;
                setUploadFile(null);
                return;
            }
            setUploadFile(file);
        }
    };

    const confirmarUploadRestaurar = async () => {
        if (!uploadFile) return;
        setShowUploadRestoreModal(false);
        setActionLoading(true);
        setLoadingMessage('Enviando e restaurando arquivo de backup. Aguarde...');

        try {
            const res = await BackupDataService.uploadERestaurar(uploadFile);
            toast.success(res.data.mensagem || 'Backup restaurado com sucesso! Recarregando...');
            setUploadFile(null);
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error('Erro na restauração por upload:', error);
            const msg = error.response?.data?.mensagem || 'Falha ao restaurar o arquivo enviado.';
            toast.error(msg);
            setActionLoading(false);
            setLoadingMessage('');
        }
    };

    const formatarData = (dataStr) => {
        if (!dataStr) return '-';
        try {
            const data = new Date(dataStr);
            return data.toLocaleString('pt-BR', {
                dateStyle: 'short',
                timeStyle: 'medium'
            });
        } catch {
            return dataStr;
        }
    };

    const googleDriveStatus = status?.googleDrive;
    const isDriveConnected = googleDriveStatus?.connected;

    return (
        <>
            <Header />
            <div className="container mt-4 mb-5">
                {/* Cabeçalho */}
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
                    <div>
                        <h2 className="mb-1 text-primary fw-bold d-flex align-items-center gap-2">
                            <i className="bi bi-shield-lock-fill"></i> Gerenciador de Backups e Dados
                        </h2>
                        <p className="text-muted mb-0">
                            Crie pontos de restauração, sincronize com o Google Drive e faça a gestão completa dos dados do sistema.
                        </p>
                    </div>
                    <div className="mt-2 mt-md-0 d-flex gap-2">
                        <Button 
                            variant="outline-info" 
                            className="d-flex align-items-center gap-2"
                            onClick={() => setShowDriveGuideModal(true)}
                        >
                            <i className="bi bi-google"></i> Guia Google Drive
                        </Button>
                        <Button
                            variant="primary"
                            className="d-flex align-items-center gap-2 shadow-sm"
                            onClick={handleCriarBackup}
                            disabled={actionLoading}
                        >
                            <i className="bi bi-cloud-arrow-up-fill"></i> Criar Backup Agora
                        </Button>
                    </div>
                </div>

                {/* Overlay de carregamento para ações demoradas */}
                {actionLoading && (
                    <Alert variant="info" className="d-flex align-items-center gap-3 shadow-sm py-3 mb-4">
                        <Spinner animation="border" variant="primary" />
                        <div>
                            <strong className="d-block">Processando Operação de Backup</strong>
                            <span className="text-muted">{loadingMessage}</span>
                        </div>
                    </Alert>
                )}

                {/* Cards de Status */}
                <div className="row g-3 mb-4">
                    {/* Card 1: Google Drive */}
                    <div className="col-12 col-md-4">
                        <Card className="h-100 shadow-sm border-0 border-start border-4 border-success">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h6 className="text-muted mb-0 fw-semibold">Google Drive</h6>
                                    <i className="bi bi-google text-success fs-4"></i>
                                </div>
                                <div className="d-flex align-items-center gap-2 mt-2">
                                    {isDriveConnected ? (
                                        <Badge bg="success" className="px-3 py-2 fs-6">
                                            <i className="bi bi-check-circle-fill me-1"></i> Sincronizado
                                        </Badge>
                                    ) : (
                                        <Badge bg="warning" text="dark" className="px-3 py-2 fs-6">
                                            <i className="bi bi-exclamation-triangle-fill me-1"></i> Apenas Local
                                        </Badge>
                                    )}
                                </div>
                                <small className="text-muted d-block mt-2">
                                    {isDriveConnected 
                                        ? `Pasta: ${googleDriveStatus?.folderName || 'Conectada'}` 
                                        : 'Backups salvos no servidor local. Configure o Drive para envio automático.'}
                                </small>
                            </Card.Body>
                        </Card>
                    </div>

                    {/* Card 2: Total de Backups */}
                    <div className="col-12 col-md-4">
                        <Card className="h-100 shadow-sm border-0 border-start border-4 border-primary">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h6 className="text-muted mb-0 fw-semibold">Backups Armazenados</h6>
                                    <i className="bi bi-archive-fill text-primary fs-4"></i>
                                </div>
                                <h3 className="fw-bold mb-0 text-dark">
                                    {loading ? <Spinner size="sm" animation="border" /> : backups.length}
                                </h3>
                                <small className="text-muted d-block mt-2">
                                    Pontos de restauração disponíveis no servidor
                                </small>
                            </Card.Body>
                        </Card>
                    </div>

                    {/* Card 3: Último Backup */}
                    <div className="col-12 col-md-4">
                        <Card className="h-100 shadow-sm border-0 border-start border-4 border-info">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h6 className="text-muted mb-0 fw-semibold">Último Backup</h6>
                                    <i className="bi bi-clock-history text-info fs-4"></i>
                                </div>
                                <div className="fw-bold fs-6 text-dark mt-1">
                                    {backups.length > 0 ? formatarData(backups[0].createdAt) : 'Nenhum backup realizado'}
                                </div>
                                <small className="text-muted d-block mt-2">
                                    {backups.length > 0 ? `Tamanho: ${backups[0].sizeFormatted}` : 'Clique em "Criar Backup Agora" para iniciar'}
                                </small>
                            </Card.Body>
                        </Card>
                    </div>
                </div>

                {/* Seção Principal: Tabela de Backups Salvos */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-body-secondary py-3 d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 fw-semibold d-flex align-items-center gap-2">
                            <i className="bi bi-hdd-stack-fill text-primary"></i> Histórico de Backups Salvos
                        </h5>
                        <Button variant="outline-secondary" size="sm" onClick={carregarDados} disabled={loading}>
                            <i className="bi bi-arrow-clockwise me-1"></i> Atualizar
                        </Button>
                    </Card.Header>
                    <Card.Body className="p-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                                <p className="text-muted mt-2">Carregando lista de backups...</p>
                            </div>
                        ) : backups.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="bi bi-inbox fs-1 text-muted"></i>
                                <p className="text-muted mt-2">Nenhum backup encontrado no servidor.</p>
                                <Button variant="primary" size="sm" onClick={handleCriarBackup}>
                                    Gerar o Primeiro Backup
                                </Button>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table hover align="middle" className="mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Data / Hora</th>
                                            <th>Nome do Arquivo</th>
                                            <th>Tamanho</th>
                                            <th>Destino</th>
                                            <th className="text-end pe-3">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {backups.map((b) => (
                                            <tr key={b.filename}>
                                                <td className="fw-semibold">
                                                    <i className="bi bi-calendar-event me-2 text-muted"></i>
                                                    {formatarData(b.createdAt)}
                                                </td>
                                                <td>
                                                    <code className="text-dark bg-light px-2 py-1 rounded">
                                                        {b.filename}
                                                    </code>
                                                </td>
                                                <td>{b.sizeFormatted}</td>
                                                <td>
                                                    <div className="d-flex gap-1 flex-wrap">
                                                        <Badge bg="secondary" className="fw-normal">
                                                            <i className="bi bi-hdd me-1"></i> Local
                                                        </Badge>
                                                        {b.googleDrive?.synced && (
                                                            <Badge bg="success" className="fw-normal">
                                                                <i className="bi bi-google me-1"></i> Drive
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="text-end pe-3">
                                                    <div className="btn-group btn-group-sm">
                                                        <Button
                                                            variant="outline-primary"
                                                            title="Baixar para o computador"
                                                            onClick={() => handleDownload(b.filename)}
                                                        >
                                                            <i className="bi bi-download"></i> Baixar
                                                        </Button>
                                                        <Button
                                                            variant="outline-warning"
                                                            title="Restaurar este backup"
                                                            onClick={() => {
                                                                setSelectedBackupToRestore(b.filename);
                                                                setShowRestoreModal(true);
                                                            }}
                                                        >
                                                            <i className="bi bi-arrow-counterclockwise"></i> Restaurar
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            title="Excluir backup"
                                                            onClick={() => {
                                                                setSelectedBackupToDelete(b.filename);
                                                                setShowDeleteModal(true);
                                                            }}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Seção: Restaurar a partir de Arquivo Externo (Upload) */}
                <Card className="shadow-sm border-0 border-top border-4 border-warning">
                    <Card.Body>
                        <h5 className="fw-bold mb-2 text-warning-emphasis d-flex align-items-center gap-2">
                            <i className="bi bi-upload"></i> Restaurar Backup a partir de Arquivo (.zip)
                        </h5>
                        <p className="text-muted small mb-3">
                            Tem um arquivo de backup salvo em seu computador ou pen drive? Você pode enviá-lo diretamente para restaurar os dados do sistema.
                        </p>

                        <div className="row g-2 align-items-center">
                            <div className="col-12 col-md-8">
                                <Form.Control
                                    type="file"
                                    accept=".zip"
                                    onChange={handleFileChange}
                                    disabled={actionLoading}
                                />
                            </div>
                            <div className="col-12 col-md-4">
                                <Button
                                    variant="warning"
                                    className="w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
                                    disabled={!uploadFile || actionLoading}
                                    onClick={() => setShowUploadRestoreModal(true)}
                                >
                                    <i className="bi bi-arrow-repeat"></i> Carregar e Restaurar
                                </Button>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </div>

            {/* Modal: Confirmação de Restauração da Lista */}
            <Modal show={showRestoreModal} onHide={() => setShowRestoreModal(false)} centered>
                <Modal.Header closeButton className="bg-warning text-dark">
                    <Modal.Title className="fs-5 fw-bold d-flex align-items-center gap-2">
                        <i className="bi bi-exclamation-triangle-fill"></i> Confirmar Restauração de Dados
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Você está prestes a restaurar a aplicação a partir do backup:
                    </p>
                    <Alert variant="secondary" className="py-2 text-center">
                        <strong>{selectedBackupToRestore}</strong>
                    </Alert>
                    <Alert variant="danger" className="mb-0">
                        <strong className="d-block mb-1">⚠️ ATENÇÃO:</strong>
                        Esta ação irá sobrescrever o banco de dados atual e os arquivos de upload pelo estado do backup escolhido. Dados cadastrados após a data deste backup serão perdidos.
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRestoreModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={confirmarRestaurar}>
                        Sim, Restaurar Dados
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal: Confirmação de Restauração via Upload */}
            <Modal show={showUploadRestoreModal} onHide={() => setShowUploadRestoreModal(false)} centered>
                <Modal.Header closeButton className="bg-danger text-white">
                    <Modal.Title className="fs-5 fw-bold d-flex align-items-center gap-2">
                        <i className="bi bi-exclamation-octagon-fill"></i> Restaurar Dados via Arquivo Enviado
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Arquivo selecionado: <strong>{uploadFile?.name}</strong>
                    </p>
                    <Alert variant="danger" className="mb-0">
                        <strong className="d-block mb-1">Aviso Crítico de Segurança:</strong>
                        O banco de dados e os arquivos serão integralmente substituídos pelo conteúdo desse arquivo .zip. Certifique-se de que este é um arquivo de backup confiável e gerado pelo Smart Garage.
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowUploadRestoreModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={confirmarUploadRestaurar}>
                        Confirmar e Substituir Dados
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal: Confirmação de Exclusão */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fs-5">Excluir Backup</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Tem certeza que deseja excluir o backup <strong>{selectedBackupToDelete}</strong>?
                    Essa ação removerá o arquivo do servidor (e do Google Drive, se sincronizado).
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={confirmarExclusao}>
                        Excluir
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal: Guia Google Drive */}
            <Modal show={showDriveGuideModal} onHide={() => setShowDriveGuideModal(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title className="fs-5 fw-bold d-flex align-items-center gap-2">
                        <i className="bi bi-google"></i> Como Ativar a Sincronização com o Google Drive
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-muted">
                        Para que o Smart Garage envie cópias automáticas para o seu Google Drive, siga estes 3 passos simples:
                    </p>
                    <ol className="list-group list-group-numbered mb-3">
                        <li className="list-group-item d-flex justify-content-between align-items-start">
                            <div className="ms-2 me-auto">
                                <div className="fw-bold">Crie uma Pasta no Google Drive</div>
                                No seu Google Drive pessoal ou empresarial, crie uma pasta (ex: <code>Backups Smart Garage</code>). Abra a pasta e copie o ID da pasta que aparece na barra de endereço (a parte final após <code>folders/</code>).
                            </div>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-start">
                            <div className="ms-2 me-auto">
                                <div className="fw-bold">Crie uma Conta de Serviço (Google Cloud)</div>
                                No <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer">Google Cloud Console</a>, crie um projeto gratuito, ative a <strong>Google Drive API</strong>, crie uma <strong>Conta de Serviço (Service Account)</strong> e gere uma Chave JSON.
                            </div>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-start">
                            <div className="ms-2 me-auto">
                                <div className="fw-bold">Compartilhe a Pasta e configure o .env</div>
                                Compartilhe a pasta do Google Drive com o e-mail da sua conta de serviço (com permissão de <strong>Editor</strong>). Por fim, adicione as chaves no arquivo <code>.env</code> do servidor.
                            </div>
                        </li>
                    </ol>

                    <Alert variant="secondary" className="mb-0">
                        <small className="d-block text-muted mb-1 fw-bold">Variáveis a preencher no <code>.env</code>:</small>
                        <pre className="mb-0 small bg-dark text-white p-2 rounded">
{`GOOGLE_DRIVE_FOLDER_ID=1AbCdEfGhIjKlMnOpQrStUvWxYz...
GOOGLE_SERVICE_ACCOUNT_EMAIL=seu-backup@projeto.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"
BACKUP_AUTO_HOURS=24`}
                        </pre>
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowDriveGuideModal(false)}>
                        Entendi
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default GerenciarBackups;
