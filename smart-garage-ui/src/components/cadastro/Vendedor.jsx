import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header';
import VendedorDataService from '../../services/vendedorDataService';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import HelpPopover from "../HelpPopover";

const RegistroVendedor = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ nome: '', usuario: '', email: '', senha: '', telefone: '' });
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErro('');
        setSucesso('');

        try {
            await VendedorDataService.create(formData);
            setSucesso('Vendedor cadastrado com sucesso!');
            setTimeout(() => navigate('/listagem/vendedores'), 1500);
        } catch (error) {
            setErro(error.response?.data?.mensagem || 'Erro ao cadastrar vendedor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className="container mt-4">
                <Card className="form-card mx-auto mb-3" style={{ maxWidth: '600px' }}>
                    <Card.Header>
                        <div className="d-flex align-items-center">
                            <h3 className="mb-0 me-2">Cadastrar Novo Vendedor</h3>
                            <HelpPopover
                                id="page-help-popover"
                                title="Ajuda: Cadastro de Vendedor"
                                content={
                                    <>
                                        <p style={{ textAlign: "justify" }}>
                                            Esta página é destinada ao cadastro de novos vendedores no sistema, criando um perfil e credenciais de acesso para eles.
                                        </p>
                                        <strong>Fluxo de Trabalho:</strong>
                                        <ol className="mt-1" style={{ textAlign: "justify" }}>
                                            <li className='mb-1'>
                                                <strong>Dados Pessoais:</strong> Preencha o nome completo, e-mail e telefone do vendedor para fins de registro e contato.
                                            </li>
                                            <li>
                                                <strong>Credenciais de Acesso:</strong> Defina um "Nome de Usuário" e uma "Senha", que serão utilizados pelo vendedor para fazer login no sistema.
                                            </li>
                                        </ol>
                                    </>
                                }
                            />
                        </div>
                        <p className="text-muted small mb-0 mt-3">
                            Campos com <span className="text-danger">*</span> são de preenchimento obrigatório.
                        </p>
                    </Card.Header>
                    <Card.Body>

                        {sucesso &&
                            <div className="alert alert-success d-flex align-items-center" role="alert">
                                <i className="bi bi-check-circle-fill me-2"></i>
                                <div>{sucesso}</div>
                            </div>
                        }

                        {erro &&
                            <div className="alert alert-danger d-flex align-items-center" role="alert">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                <div>{erro}</div>
                            </div>
                        }

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3 mt-0">
                                <Form.Label htmlFor="nome">Nome Completo <span className="text-danger">*</span></Form.Label>
                                <Form.Control id="nome" name="nome" type="text" onChange={handleInputChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="email">E-mail <span className="text-danger">*</span></Form.Label>
                                <Form.Control id="email" name="email" type="email" onChange={handleInputChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="telefone">Telefone <span className="text-danger">*</span></Form.Label>
                                <Form.Control id="telefone" name="telefone" onChange={handleInputChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="usuario">Nome de Usuário (para login) <span className="text-danger">*</span></Form.Label>
                                <Form.Control id="usuario" name="usuario" type="text" onChange={handleInputChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="senha">Senha <span className="text-danger">*</span></Form.Label>
                                <Form.Control id="senha" name="senha" type="password" onChange={handleInputChange} />
                            </Form.Group>
                            <div className="d-grid">
                                <Button variant="primary" type="submit" disabled={loading}>
                                    {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Cadastrar Vendedor'}
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </div>
        </>
    );
};

export default RegistroVendedor;